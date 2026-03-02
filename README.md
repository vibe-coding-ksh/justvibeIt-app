# JustVibeIt

> **Build your own website by talking to AI. No coding required.**

[한국어](README.ko.md) | English

[![Stars](https://img.shields.io/github/stars/vibe-coding-ksh/justvibeIt-app?style=social)](https://github.com/vibe-coding-ksh/justvibeIt-app)
[![Forks](https://img.shields.io/github/forks/vibe-coding-ksh/justvibeIt-app?style=social)](https://github.com/vibe-coding-ksh/justvibeIt-app/fork)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

JustVibeIt is a **vibe coding starter kit** for non-developers. Fork this repo, open it in an AI-powered IDE like [Cursor](https://cursor.sh) or [Antigravity](https://antigravity.ai), and start building your website just by talking to AI.

---

## Who is this for?

- People who want their own website but don't know how to code
- Anyone who wants to build a site by chatting with AI
- Developers who want a quick React + Appwrite boilerplate

---

## Quick Start

### Option A: Use the Installer (Recommended)

Download the **JustVibeIt Installer** from [Releases](https://github.com/vibe-coding-ksh/justvibeIt-app/releases).

| Platform | File |
|----------|------|
| macOS | `JustVibeIt-Installer-x.x.x-mac.dmg` |
| Windows | `JustVibeIt-Installer-x.x.x-setup.exe` or `...-portable.exe` |

The installer will:
1. Check and install required tools (Git, Node.js, GitHub CLI)
   - **macOS**: auto-installs via Homebrew
   - **Windows**: auto-installs via winget (Windows 10/11 built-in)
2. Log you into GitHub
3. Fork this repo to your account (and star it!)
4. Clone it to your computer
5. Install all dependencies
6. Open it in your preferred IDE

### Option B: Manual Setup

```bash
# 1. Fork this repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/justvibeIt-app.git
cd justvibeIt-app

# 2. Initialize the project
npm run init

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your Appwrite credentials

# 4. Start developing
npm run dev
```

Open http://localhost:5157 in your browser.

---

## Appwrite Setup

This project uses [Appwrite](https://appwrite.io) as the backend (auth, database, storage).

### 1. Create an Appwrite Project

- Go to [cloud.appwrite.io](https://cloud.appwrite.io) (free tier available)
- Create a new project
- Copy the **Project ID** and **Endpoint**

### 2. Configure Environment Variables

Edit your `.env` file:

```
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
```

### 3. Set Up Google OAuth (Optional)

1. Create OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com)
2. In Appwrite Console → Auth → Settings → OAuth2 Providers → Enable Google
3. Enter your Client ID and Secret

### 4. Create Database Collections

In Appwrite Console → Databases, create a database (ID: `main`) with these collections:

**site_config** - Site settings
| Attribute | Type | Required |
|-----------|------|----------|
| site_name | string | yes |
| description | string | no |
| theme | string | no |

**profiles** - User profiles
| Attribute | Type | Required |
|-----------|------|----------|
| user_id | string | no |
| name | string | yes |
| title | string | no |
| bio | string | no |
| avatar | string | no |
| links | string | no |

**projects** - Portfolio projects
| Attribute | Type | Required |
|-----------|------|----------|
| user_id | string | no |
| title | string | yes |
| description | string | no |
| image | string | no |
| tags | string[] | no |
| link | string | no |
| sort_order | integer | no |

### 5. Create Storage Bucket

In Appwrite Console → Storage, create a bucket named `images` with public read access.

---

## Talk to AI

Open this project in Cursor or Antigravity and try saying:

- "Change my name to John Doe"
- "Add a new project"
- "Make the background blue"
- "Add a blog section"
- "Deploy this"

The AI will modify the code, update data, and even deploy for you!

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local development server |
| `npm run init` | Initialize project (first time setup) |
| `npm run build` | Build for production |
| `npm run deploy` | Deploy to GitHub Pages |
| `npm run test` | Run tests |

---

## Tech Stack

- **React 18** + TypeScript + Vite
- **Tailwind CSS** + shadcn/ui + MUI
- **Appwrite** (Auth + Database + Storage)
- **GitHub Pages** for deployment

---

## Supported IDEs

| IDE | Description |
|-----|-------------|
| [Cursor](https://cursor.sh) | AI-powered code editor (recommended) |
| [Antigravity](https://antigravity.ai) | AI-native IDE |

---

## Deploy

```bash
npm run deploy
```

Set `VITE_BASE_PATH` in your `.env` before deploying:
```
VITE_BASE_PATH=/your-repo-name/
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Security

See [SECURITY.md](SECURITY.md) for our security policy.

---

## License

[MIT](LICENSE) - feel free to use this for anything!
