# Contributing to JustVibeIt

Thank you for your interest in contributing to JustVibeIt! This project aims to make vibe coding accessible to everyone.

## How to Contribute

### Reporting Bugs

1. Check if the issue already exists in [Issues](https://github.com/vibe-coding-ksh/justvibeIt-app/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Your OS and Node.js version

### Suggesting Features

1. Open an issue with the `enhancement` label
2. Describe the feature and why it would be useful
3. Include mockups or examples if possible

### Submitting Code

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit with a clear message: `git commit -m "Add: description of change"`
6. Push to your fork: `git push origin feature/my-feature`
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing code patterns
- Use meaningful variable and function names
- Keep components small and focused
- Write tests for new features

### Commit Messages

Use clear, descriptive commit messages:

- `Add: new feature description`
- `Fix: bug description`
- `Update: what was changed`
- `Remove: what was removed`
- `Refactor: what was refactored`

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/justvibeIt-app.git
cd justvibeIt-app

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test
```

## Project Structure

```
src/
├── App.tsx              # Main app (auth flow)
├── components/          # React components
│   ├── Login.tsx        # Google OAuth login
│   └── MainPage.tsx     # Main page after login
├── lib/
│   ├── appwrite.ts      # Appwrite client setup
│   ├── data.ts          # Data loading utilities
│   └── storage.ts       # File upload utilities
└── types/
    └── index.ts         # TypeScript type definitions
```

## Questions?

Feel free to open an issue or start a discussion. We're happy to help!
