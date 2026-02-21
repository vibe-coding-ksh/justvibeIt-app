const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

const TEMPLATE_REPO = 'your-org/justvibeIt-app';
const IS_MAC = process.platform === 'darwin';
const IS_WIN = process.platform === 'win32';

let mainWindow;
let loginProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 680,
    resizable: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
}

app.whenReady().then(async () => {
  const ses = require('electron').session.defaultSession;
  await ses.clearCache();
  await ses.clearStorageData();
  createWindow();
});
app.on('window-all-closed', () => app.quit());

const ENV_PATH = IS_WIN
  ? process.env.PATH
  : `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH}`;

function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, {
      timeout: options.timeout || 120000,
      env: { ...process.env, PATH: ENV_PATH },
    }, (error, stdout, stderr) => {
      if (error) reject({ error: error.message, stderr, stdout });
      else resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
}

// === Step 0: 환경 체크 ===

ipcMain.handle('get-platform', () => process.platform);

ipcMain.handle('check-brew', async () => {
  if (IS_WIN) return { installed: true, skip: true };
  try {
    await runCommand('brew --version');
    return { installed: true };
  } catch { return { installed: false }; }
});

ipcMain.handle('check-git', async () => {
  try {
    const r = await runCommand('git --version');
    return { installed: true, version: r.stdout };
  } catch { return { installed: false }; }
});

ipcMain.handle('check-node', async () => {
  try {
    const r = await runCommand('node --version');
    return { installed: true, version: r.stdout };
  } catch { return { installed: false }; }
});

ipcMain.handle('check-gh', async () => {
  try {
    const r = await runCommand('gh --version');
    return { installed: true, version: r.stdout.split('\n')[0] };
  } catch { return { installed: false }; }
});

// === Step 0: 설치 ===

ipcMain.handle('install-brew', async () => {
  if (IS_WIN) return { success: true, skip: true };
  try {
    await runCommand(`osascript -e 'tell app "Terminal" to activate' -e 'tell app "Terminal" to do script "/bin/bash -c \\"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\\""'`);
    return { success: true, message: '터미널에서 Homebrew 설치가 시작됐어요. 비밀번호를 입력하고 설치가 끝나면 "다시 확인"을 눌러주세요.' };
  } catch (err) {
    return { success: false, message: err.stderr || err.error };
  }
});

ipcMain.handle('install-git', async () => {
  if (IS_WIN) {
    shell.openExternal('https://git-scm.com/download/win');
    return { success: true, message: '다운로드 페이지가 열렸어요! 설치 후 "다시 확인"을 눌러주세요.' };
  }
  try {
    await runCommand('xcode-select --install 2>&1 || true');
    return { success: true, message: '설치 창이 떴어요! "설치" 버튼을 누르고 완료되면 "다시 확인"을 눌러주세요.' };
  } catch (err) {
    return { success: false, message: err.stderr || err.error };
  }
});

ipcMain.handle('install-node', async () => {
  if (IS_WIN) {
    shell.openExternal('https://nodejs.org/ko/download/');
    return { success: true, message: '다운로드 페이지가 열렸어요! LTS 버전을 설치 후 "다시 확인"을 눌러주세요.' };
  }
  try {
    await runCommand('brew install node', { timeout: 300000 });
    return { success: true };
  } catch (err) {
    return { success: false, message: err.stderr || err.error };
  }
});

ipcMain.handle('install-gh', async () => {
  if (IS_WIN) {
    shell.openExternal('https://cli.github.com/');
    return { success: true, message: '다운로드 페이지가 열렸어요! 설치 후 "다시 확인"을 눌러주세요.' };
  }
  try {
    await runCommand('brew install gh', { timeout: 300000 });
    return { success: true };
  } catch (err) {
    return { success: false, message: err.stderr || err.error };
  }
});

// === Step 1: GitHub 로그인 ===

ipcMain.handle('check-gh-auth', async () => {
  try {
    const r = await runCommand('gh auth status 2>&1');
    const output = r.stdout || r.stderr || '';
    const match = output.match(/Logged in to .+ account (.+?)[\s(]/) || output.match(/Logged in to .+ as (.+)/);
    return { loggedIn: true, username: match ? match[1].trim() : 'authenticated' };
  } catch { return { loggedIn: false }; }
});

ipcMain.handle('gh-login', async () => {
  return new Promise((resolve) => {
    if (loginProcess) { try { loginProcess.kill(); } catch {} loginProcess = null; }

    const ghBin = IS_MAC && fs.existsSync('/opt/homebrew/bin/gh') ? '/opt/homebrew/bin/gh' : 'gh';

    loginProcess = spawn(ghBin, [
      'auth', 'login',
      '--hostname', 'github.com',
      '--web',
      '--git-protocol', 'https',
      '--scopes', 'repo',
    ], {
      env: { ...process.env, PATH: ENV_PATH, GH_PROMPT_DISABLED: '1' },
    });

    let output = '';
    let codeFound = false;
    let urlOpened = false;

    const handleData = (data) => {
      output += data.toString();

      if (!urlOpened) {
        const urlMatch = output.match(/(https:\/\/github\.com\/login\/device)/i);
        if (urlMatch) {
          urlOpened = true;
          shell.openExternal(urlMatch[1]);
        }
      }

      if (!codeFound) {
        const m = output.match(/one-time code[:\s]*([A-Z0-9]{4}-[A-Z0-9]{4})/i);
        if (m) {
          codeFound = true;
          resolve({ success: true, code: m[1], message: '브라우저에서 아래 코드를 입력해주세요.' });
        }
      }
    };

    loginProcess.stdout.on('data', handleData);
    loginProcess.stderr.on('data', handleData);

    loginProcess.on('close', (code) => {
      loginProcess = null;
      if (!codeFound) {
        resolve(code === 0
          ? { success: true, code: null, message: '로그인 완료!' }
          : { success: false, message: `로그인 실패\n${output.trim()}` });
      }
    });

    loginProcess.on('error', (err) => {
      loginProcess = null;
      if (!codeFound) resolve({ success: false, message: err.message });
    });

    setTimeout(() => {
      if (!codeFound) {
        resolve({ success: false, message: '시간 초과. 다시 시도해주세요.' });
        if (loginProcess) { try { loginProcess.kill(); } catch {} loginProcess = null; }
      }
    }, 60000);
  });
});

ipcMain.handle('gh-login-wait', async () => {
  if (!loginProcess) return { done: true };
  return new Promise((resolve) => {
    const iv = setInterval(() => {
      if (!loginProcess) { clearInterval(iv); resolve({ done: true }); }
    }, 1000);
    setTimeout(() => { clearInterval(iv); resolve({ done: !loginProcess }); }, 120000);
  });
});

// === Step 2: 프로젝트 생성 (Template) ===

ipcMain.handle('create-from-template', async (_, repoName) => {
  try {
    await runCommand(`gh repo create "${repoName}" --template "${TEMPLATE_REPO}" --private --clone=false`, { timeout: 60000 });
    const r = await runCommand('gh api user --jq .login');
    const username = r.stdout.trim();
    return { success: true, repoUrl: `https://github.com/${username}/${repoName}`, owner: username };
  } catch (err) {
    const msg = err.stderr || err.error || '';
    if (msg.includes('already exists')) {
      return { success: false, message: '같은 이름의 레포가 이미 있어요. 다른 이름을 입력해주세요.' };
    }
    return { success: false, message: msg };
  }
});

ipcMain.handle('list-my-repos', async () => {
  try {
    const r = await runCommand(
      `gh repo list --limit 50 --json name,description,updatedAt --jq '.[] | "\\(.name)|||\\(.description // "")|||\\(.updatedAt)"'`
    );
    const repos = r.stdout.split('\n').filter(Boolean).map(line => {
      const [name, description, updatedAt] = line.split('|||');
      return { name, description, updatedAt };
    });
    return { success: true, repos };
  } catch (err) {
    return { success: false, message: err.stderr || err.error, repos: [] };
  }
});

// === Step 3: Clone ===

ipcMain.handle('clone-repo', async (_, { repoName, targetDir, owner }) => {
  try {
    const clonePath = path.join(targetDir, repoName);
    if (fs.existsSync(clonePath)) {
      return { success: false, message: '이미 같은 이름의 폴더가 있어요. 다른 위치를 선택해주세요.' };
    }
    const httpsUrl = `https://github.com/${owner}/${repoName}.git`;
    await runCommand(`git clone "${httpsUrl}" "${clonePath}"`, { timeout: 300000 });
    return { success: true, path: clonePath };
  } catch (err) {
    return { success: false, message: err.stderr || err.error };
  }
});

ipcMain.handle('clone-existing', async (_, { repoName, targetDir, owner }) => {
  try {
    const clonePath = path.join(targetDir, repoName);
    if (fs.existsSync(clonePath)) {
      return { success: false, message: '이미 같은 이름의 폴더가 있어요. 다른 위치를 선택해주세요.' };
    }
    const httpsUrl = `https://github.com/${owner}/${repoName}.git`;
    await runCommand(`git clone "${httpsUrl}" "${clonePath}"`, { timeout: 300000 });
    return { success: true, path: clonePath };
  } catch (err) {
    return { success: false, message: err.stderr || err.error };
  }
});

// === Step 3: 현재 로그인 유저 ===

ipcMain.handle('get-gh-username', async () => {
  try {
    const r = await runCommand('gh api user --jq .login');
    return { success: true, username: r.stdout.trim() };
  } catch {
    return { success: false, username: '' };
  }
});

// === 공통 ===

ipcMain.handle('select-folder', async () => {
  const r = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: '프로젝트를 저장할 폴더를 선택하세요',
  });
  if (r.canceled) return { canceled: true };
  return { canceled: false, path: r.filePaths[0] };
});

ipcMain.handle('open-in-ide', async (_, { projectPath, ide }) => {
  const commands = {
    cursor: IS_WIN ? 'cursor.cmd' : 'cursor',
    antigravity: IS_WIN ? 'antigravity.cmd' : 'antigravity',
  };

  const cmd = commands[ide] || commands.cursor;

  try {
    await runCommand(`${cmd} "${projectPath}"`);
    return { success: true };
  } catch {
    try {
      shell.openPath(projectPath);
      const fileManager = IS_WIN ? '탐색기' : 'Finder';
      return { success: true, message: `${ide} CLI가 없어서 ${fileManager}에서 열었어요. ${ide}에서 직접 폴더를 열어주세요.` };
    } catch { return { success: false, message: `${ide}를 열 수 없어요.` }; }
  }
});

ipcMain.handle('init-project', async (_, { projectPath, repoName }) => {
  const send = (data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('init-log', data);
    }
  };

  const handleLine = (line) => {
    line = line.trim();
    if (!line) return;

    if (line.includes('📦 1.') || line.includes('기본 패키지 설치 중')) send({ step: 1, status: 'running', text: '기본 패키지 설치 중...' });
    else if (line.includes('📦 2.') || line.includes('Supabase')) send({ step: 2, status: 'running', text: 'Supabase 클라이언트 설치 중...' });
    else if (line.includes('🎨 3.') || line.includes('UI 라이브러리')) send({ step: 3, status: 'running', text: 'UI 라이브러리 설치 중...' });
    else if (line.includes('🧪 4.') || line.includes('TDD')) send({ step: 4, status: 'running', text: '테스트 환경 설치 중...' });
    else if (line.includes('🎉 초기화가 완료')) send({ step: 5, status: 'done', text: '모든 설정 완료!' });
    else if (line.includes('added') && line.includes('packages')) send({ log: line });
    else if (line.includes('⚠️') || line.includes('❌')) send({ step: 0, status: 'warn', text: line.replace(/^.*?(⚠️|❌)\s*/, '') });

    send({ log: line });
  };

  function spawnStep(cmd, args, cwd, envExtra = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, {
        cwd,
        env: { ...process.env, PATH: ENV_PATH, ...envExtra },
        shell: true,
      });
      child.stdout.on('data', (d) => d.toString().split('\n').forEach(handleLine));
      child.stderr.on('data', (d) => d.toString().split('\n').forEach(handleLine));
      child.on('close', (code) => resolve(code));
      child.on('error', (err) => reject(err));
    });
  }

  try {
    send({ step: 1, status: 'running', text: '기본 패키지 설치 중...' });

    const initScript = path.join(projectPath, 'scripts', 'init.sh');

    if (fs.existsSync(initScript)) {
      const code = await spawnStep('bash', ['scripts/init.sh'], projectPath, { REPO_NAME: repoName || '' });
      if (code !== 0) {
        send({ step: 0, status: 'warn', text: 'init.sh 실행 중 오류 발생' });
      }
    } else {
      await spawnStep('npm', ['install'], projectPath);
    }

    send({ step: 5, status: 'done', text: '모든 설정 완료!' });
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
});
