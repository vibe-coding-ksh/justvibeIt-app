const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

const UPSTREAM_REPO = 'vibe-coding-ksh/justvibeIt-app';
const IS_MAC = process.platform === 'darwin';
const IS_WIN = process.platform === 'win32';

let mainWindow;
let loginProcess = null;

function createWindow() {
  const winOptions = {
    width: 480,
    height: 680,
    resizable: false,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };

  if (IS_MAC) {
    winOptions.titleBarStyle = 'hiddenInset';
    winOptions.trafficLightPosition = { x: 16, y: 16 };
  } else {
    winOptions.frame = true;
    winOptions.autoHideMenuBar = true;
  }

  mainWindow = new BrowserWindow(winOptions);
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

// === Step 0: Environment Checks ===

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

// === Step 0: Check winget (Windows) ===

ipcMain.handle('check-winget', async () => {
  if (IS_MAC) return { installed: true, skip: true };
  try {
    await runCommand('winget --version');
    return { installed: true };
  } catch { return { installed: false }; }
});

// === Step 0: Install Tools ===

ipcMain.handle('install-brew', async () => {
  if (IS_WIN) return { success: true, skip: true };
  try {
    await runCommand(`osascript -e 'tell app "Terminal" to activate' -e 'tell app "Terminal" to do script "/bin/bash -c \\"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\\""'`);
    return { success: true, message: 'Homebrew installation started in Terminal. Enter your password and click "Re-check" when done.' };
  } catch (err) {
    return { success: false, message: err.stderr || err.error };
  }
});

ipcMain.handle('install-git', async () => {
  if (IS_WIN) {
    try {
      await runCommand('winget install --id Git.Git --accept-source-agreements --accept-package-agreements --silent', { timeout: 300000 });
      return { success: true, message: 'Git 설치 완료! "다시 확인"을 눌러주세요.' };
    } catch {
      shell.openExternal('https://git-scm.com/download/win');
      return { success: true, message: '자동 설치에 실패했어요. 다운로드 페이지에서 직접 설치 후 "다시 확인"을 눌러주세요.' };
    }
  }
  try {
    await runCommand('xcode-select --install 2>&1 || true');
    return { success: true, message: 'Install dialog opened! Click "Install" and then "Re-check".' };
  } catch (err) {
    return { success: false, message: err.stderr || err.error };
  }
});

ipcMain.handle('install-node', async () => {
  if (IS_WIN) {
    try {
      await runCommand('winget install --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --silent', { timeout: 300000 });
      return { success: true, message: 'Node.js 설치 완료! "다시 확인"을 눌러주세요.' };
    } catch {
      shell.openExternal('https://nodejs.org/en/download/');
      return { success: true, message: '자동 설치에 실패했어요. 다운로드 페이지에서 LTS 버전을 설치 후 "다시 확인"을 눌러주세요.' };
    }
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
    try {
      await runCommand('winget install --id GitHub.cli --accept-source-agreements --accept-package-agreements --silent', { timeout: 300000 });
      return { success: true, message: 'GitHub CLI 설치 완료! "다시 확인"을 눌러주세요.' };
    } catch {
      shell.openExternal('https://cli.github.com/');
      return { success: true, message: '자동 설치에 실패했어요. 다운로드 페이지에서 직접 설치 후 "다시 확인"을 눌러주세요.' };
    }
  }
  try {
    await runCommand('brew install gh', { timeout: 300000 });
    return { success: true };
  } catch (err) {
    return { success: false, message: err.stderr || err.error };
  }
});

// === Step 1: GitHub Login ===

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
      '--scopes', 'repo,delete_repo',
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
          resolve({ success: true, code: m[1], message: 'Enter the code below in your browser.' });
        }
      }
    };

    loginProcess.stdout.on('data', handleData);
    loginProcess.stderr.on('data', handleData);

    loginProcess.on('close', (code) => {
      loginProcess = null;
      if (!codeFound) {
        resolve(code === 0
          ? { success: true, code: null, message: 'Login complete!' }
          : { success: false, message: `Login failed\n${output.trim()}` });
      }
    });

    loginProcess.on('error', (err) => {
      loginProcess = null;
      if (!codeFound) resolve({ success: false, message: err.message });
    });

    setTimeout(() => {
      if (!codeFound) {
        resolve({ success: false, message: 'Timeout. Please try again.' });
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

// === Step 2: Fork + Star ===

ipcMain.handle('fork-and-star', async (_, repoName) => {
  try {
    // 1. Fork the upstream repo
    const forkCmd = repoName
      ? `gh repo fork ${UPSTREAM_REPO} --fork-name "${repoName}" --clone=false`
      : `gh repo fork ${UPSTREAM_REPO} --clone=false`;
    await runCommand(forkCmd, { timeout: 60000 });

    // 2. Star the upstream repo (PUT /user/starred/{owner}/{repo})
    try {
      await runCommand(`gh api -X PUT /user/starred/${UPSTREAM_REPO} --silent`);
    } catch {
      // Star failure is non-critical
    }

    // 3. Get the fork info
    const r = await runCommand('gh api user --jq .login');
    const username = r.stdout.trim();
    const finalName = repoName || UPSTREAM_REPO.split('/')[1];
    return {
      success: true,
      repoUrl: `https://github.com/${username}/${finalName}`,
      owner: username,
      repoName: finalName,
    };
  } catch (err) {
    const msg = err.stderr || err.error || '';
    if (msg.includes('already exists')) {
      return { success: false, message: 'A repo with this name already exists. Please choose a different name.' };
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
      return { success: false, message: 'A folder with this name already exists. Please choose a different location.' };
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
      return { success: false, message: 'A folder with this name already exists. Please choose a different location.' };
    }
    const httpsUrl = `https://github.com/${owner}/${repoName}.git`;
    await runCommand(`git clone "${httpsUrl}" "${clonePath}"`, { timeout: 300000 });
    return { success: true, path: clonePath };
  } catch (err) {
    return { success: false, message: err.stderr || err.error };
  }
});

// === Step 3: Current user ===

ipcMain.handle('get-gh-username', async () => {
  try {
    const r = await runCommand('gh api user --jq .login');
    return { success: true, username: r.stdout.trim() };
  } catch {
    return { success: false, username: '' };
  }
});

// === Common ===

ipcMain.handle('select-folder', async () => {
  const r = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select a folder to save the project',
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
      const fileManager = IS_WIN ? 'Explorer' : 'Finder';
      return { success: true, message: `${ide} CLI not found. Opened in ${fileManager} instead. Please open the folder manually in ${ide}.` };
    } catch { return { success: false, message: `Cannot open ${ide}.` }; }
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

    if (line.includes('📦 1.') || line.includes('기본 패키지 설치 중') || line.includes('Installing base')) send({ step: 1, status: 'running', text: 'Installing packages...' });
    else if (line.includes('📦 2.') || line.includes('Appwrite')) send({ step: 2, status: 'running', text: 'Installing Appwrite SDK...' });
    else if (line.includes('🎨 3.') || line.includes('UI')) send({ step: 3, status: 'running', text: 'Installing UI libraries...' });
    else if (line.includes('🧪 4.') || line.includes('TDD') || line.includes('test')) send({ step: 4, status: 'running', text: 'Setting up test environment...' });
    else if (line.includes('🎉') || line.includes('완료') || line.includes('complete')) send({ step: 5, status: 'done', text: 'All done!' });
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
    send({ step: 1, status: 'running', text: 'Installing packages...' });

    const initScript = path.join(projectPath, 'scripts', 'init.sh');

    if (fs.existsSync(initScript)) {
      let shellCmd = 'bash';
      if (IS_WIN) {
        const gitBashPath = 'C:\\Program Files\\Git\\bin\\bash.exe';
        shellCmd = fs.existsSync(gitBashPath) ? `"${gitBashPath}"` : 'bash';
      }
      const code = await spawnStep(shellCmd, ['scripts/init.sh'], projectPath, { REPO_NAME: repoName || '' });
      if (code !== 0 && IS_WIN) {
        send({ step: 1, status: 'running', text: 'Fallback: npm install...' });
        await spawnStep(IS_WIN ? 'npm.cmd' : 'npm', ['install'], projectPath);
      } else if (code !== 0) {
        send({ step: 0, status: 'warn', text: 'init.sh encountered an error' });
      }
    } else {
      await spawnStep(IS_WIN ? 'npm.cmd' : 'npm', ['install'], projectPath);
    }

    // Auto-set VITE_BASE_PATH in .env if needed
    const envPath = path.join(projectPath, '.env');
    const envExamplePath = path.join(projectPath, '.env.example');
    if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
    }

    send({ step: 5, status: 'done', text: 'All done!' });
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message || String(err) };
  }
});
