# JustVibeIt

> **AI와 대화하면서 나만의 웹사이트를 만들어보세요. 코딩 경험이 필요 없습니다.**

한국어 | [English](README.md)

[![Stars](https://img.shields.io/github/stars/vibe-coding-ksh/justvibeIt-app?style=social)](https://github.com/vibe-coding-ksh/justvibeIt-app)
[![Forks](https://img.shields.io/github/forks/vibe-coding-ksh/justvibeIt-app?style=social)](https://github.com/vibe-coding-ksh/justvibeIt-app/fork)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

JustVibeIt은 비개발자를 위한 **바이브 코딩 스타터 킷**입니다. 이 저장소를 포크하고, [Cursor](https://cursor.sh)나 [Antigravity](https://antigravity.ai) 같은 AI IDE에서 열어서, AI와 대화하며 웹사이트를 만들어보세요.

---

## 누구를 위한 프로젝트인가요?

- 나만의 웹사이트를 갖고 싶지만 코딩을 모르는 분
- AI와 대화하면서 사이트를 만들고 싶은 분
- React + Appwrite 보일러플레이트가 필요한 개발자

---

## 빠른 시작

### 방법 A: 인스톨러 사용 (추천)

[Releases](https://github.com/vibe-coding-ksh/justvibeIt-app/releases) 페이지에서 **JustVibeIt Installer**를 다운로드하세요.

| 플랫폼 | 파일 |
|--------|------|
| macOS | `JustVibeIt-Installer-x.x.x-mac.dmg` |
| Windows | `JustVibeIt-Installer-x.x.x-setup.exe` 또는 `...-portable.exe` |

인스톨러가 해주는 일:
1. 필요한 도구 확인 및 자동 설치 (Git, Node.js, GitHub CLI)
   - **macOS**: Homebrew를 통해 자동 설치
   - **Windows**: winget을 통해 자동 설치 (Windows 10/11 기본 내장)
2. GitHub 로그인
3. 이 저장소를 내 계정으로 포크 (+ 스타!)
4. 내 컴퓨터에 클론
5. 모든 의존성 설치
6. 선호하는 IDE에서 열기

### 방법 B: 수동 설치

```bash
# 1. GitHub에서 이 저장소를 포크한 후 클론
git clone https://github.com/YOUR_USERNAME/justvibeIt-app.git
cd justvibeIt-app

# 2. 프로젝트 초기화
npm run init

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일에 Appwrite 정보를 입력하세요

# 4. 개발 시작
npm run dev
```

브라우저에서 http://localhost:5157 을 열어보세요.

---

## Appwrite 설정

이 프로젝트는 백엔드로 [Appwrite](https://appwrite.io)를 사용합니다 (인증, 데이터베이스, 스토리지).

### 1. Appwrite 프로젝트 만들기

- [cloud.appwrite.io](https://cloud.appwrite.io)에 접속 (무료 플랜 가능)
- 새 프로젝트 생성
- **Project ID**와 **Endpoint** 복사

### 2. 환경 변수 설정

`.env` 파일을 수정하세요:

```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
```

### 3. Google OAuth 설정 (선택사항)

1. [Google Cloud Console](https://console.cloud.google.com)에서 OAuth 2.0 자격증명 생성
2. Appwrite 콘솔 → Auth → Settings → OAuth2 Providers → Google 활성화
3. Client ID와 Secret 입력

### 4. 데이터베이스 컬렉션 만들기

Appwrite 콘솔 → Databases에서 데이터베이스(ID: `main`)를 만들고 아래 컬렉션을 추가하세요:

**site_config** - 사이트 설정
| 속성 | 타입 | 필수 |
|------|------|------|
| site_name | string | 예 |
| description | string | 아니오 |
| theme | string | 아니오 |

**profiles** - 사용자 프로필
| 속성 | 타입 | 필수 |
|------|------|------|
| user_id | string | 아니오 |
| name | string | 예 |
| title | string | 아니오 |
| bio | string | 아니오 |
| avatar | string | 아니오 |
| links | string | 아니오 |

**projects** - 포트폴리오 프로젝트
| 속성 | 타입 | 필수 |
|------|------|------|
| user_id | string | 아니오 |
| title | string | 예 |
| description | string | 아니오 |
| image | string | 아니오 |
| tags | string[] | 아니오 |
| link | string | 아니오 |
| sort_order | integer | 아니오 |

### 5. 스토리지 버킷 만들기

Appwrite 콘솔 → Storage에서 `images`라는 이름의 버킷을 만들고 공개 읽기 권한을 설정하세요.

---

## AI와 대화하기

Cursor 또는 Antigravity에서 이 프로젝트를 열고 이렇게 말해보세요:

- "내 이름을 홍길동으로 바꿔줘"
- "새 프로젝트를 추가해줘"
- "배경색을 파란색으로 바꿔줘"
- "블로그 섹션을 추가해줘"
- "배포해줘"

AI가 코드를 수정하고, 데이터를 업데이트하고, 배포까지 해줍니다!

---

## 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 로컬 개발 서버 시작 |
| `npm run init` | 프로젝트 초기화 (최초 1회) |
| `npm run build` | 프로덕션 빌드 |
| `npm run deploy` | GitHub Pages 배포 |
| `npm run test` | 테스트 실행 |

---

## 기술 스택

- **React 18** + TypeScript + Vite
- **Tailwind CSS** + shadcn/ui + MUI
- **Appwrite** (인증 + 데이터베이스 + 스토리지)
- **GitHub Pages** 배포

---

## 지원 IDE

| IDE | 설명 |
|-----|------|
| [Cursor](https://cursor.sh) | AI 코딩 에디터 (추천) |
| [Antigravity](https://antigravity.ai) | AI 네이티브 IDE |

---

## 배포

```bash
npm run deploy
```

배포 전에 `.env`에서 `VITE_BASE_PATH`를 설정하세요:
```
VITE_BASE_PATH=/your-repo-name/
```

---

## 기여하기

가이드라인은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

---

## 보안

보안 정책은 [SECURITY.md](SECURITY.md)를 참고하세요.

---

## 라이선스

[MIT](LICENSE) - 자유롭게 사용하세요!
