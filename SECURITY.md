# Security Policy

## Reporting A Vulnerability

Do not open a public issue for vulnerabilities. Report security concerns through a
private GitHub security advisory for this repository or contact the current repository
maintainer directly if advisories are unavailable.

Include:

- affected files or workflows
- reproduction steps
- expected impact
- whether generated harness files or `.agent-work` artifacts are affected

## Supported Versions

The supported version is the current `main` branch until the first tagged release.
After tagged releases begin, supported versions are listed in `CHANGELOG.md`.

## Security Scope

This repository does not ship a runtime library. Security review focuses on:

- GitHub Actions permissions and third-party actions
- generated instruction files
- portable workflow instructions
- repository governance files
- supply-chain dependency updates
