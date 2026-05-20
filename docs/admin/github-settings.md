# GitHub Settings

These settings should be applied by a repository administrator after the workflows
exist and have run at least once.

## Branch Protection For `main`

Enable:

- Require a pull request before merging
- Require approvals: 1
- Dismiss stale pull request approvals when new commits are pushed
- Require review from CODEOWNERS
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Block force pushes
- Block deletions

Required status checks:

- `validate`

Optional after GitHub Advanced Security is enabled:

- `analyze`

## Ruleset Recommendation

Create a ruleset targeting `main` with:

- pull request required
- required status checks
- required code owner review
- non-fast-forward updates blocked
- branch deletion blocked

## Actions Settings

Use these settings:

- Allow GitHub Actions for this repository.
- Allow actions created by GitHub.
- Allow selected third-party actions used by this repository.
- Review third-party action use during dependency updates.

## Security Settings

Enable when available for the organization plan:

- Dependabot alerts
- Dependabot security updates
- Code scanning
- Secret scanning
- Private vulnerability reporting

## Administrator Exception

Direct `main` changes are reserved for explicit administrator exceptions. Record the
reason in the commit message or a follow-up issue.
