# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in JustVibeIt, please report it responsibly.

**Do NOT open a public issue for security vulnerabilities.**

Instead, please email us at: **security@justvibeit.dev** (or open a private security advisory on GitHub)

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response timeline

- We will acknowledge your report within **48 hours**
- We will provide a fix or mitigation within **7 days** for critical issues
- We will credit you in the release notes (unless you prefer anonymity)

## Security Best Practices

When using JustVibeIt:

1. **Never commit `.env` files** - They contain your Appwrite credentials
2. **Use `.env.example`** as a template - It contains no real secrets
3. **Keep dependencies updated** - Run `npm audit` regularly
4. **Review Appwrite permissions** - Set appropriate collection-level permissions
5. **Use HTTPS** - Always use HTTPS endpoints for Appwrite

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x.x   | Yes       |

## Scope

The following are in scope for security reports:

- The JustVibeIt web application source code
- The Electron installer
- Build and deployment scripts
- Configuration files

The following are **out of scope**:

- Appwrite platform vulnerabilities (report to [Appwrite](https://appwrite.io/security))
- Third-party dependencies (report to respective maintainers)
- Social engineering attacks
