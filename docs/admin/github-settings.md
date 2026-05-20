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

CodeQL:

- If GitHub CodeQL default setup is enabled, require the CodeQL checks shown by
  GitHub and keep `.github/workflows/codeql.yml` manual-only.
- If default setup is disabled and the advanced workflow is enabled for push and
  pull request events, require:
  - `analyze (python)`
  - `analyze (actions)`

Do not run CodeQL default setup and the advanced workflow on the same events;
GitHub rejects advanced-configuration SARIF submissions while default setup is
active.

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

## Community Profile Settings

Keep the GitHub Community Profile complete for the public repository:

- README: present at `README.md`
- License: MIT, present at `LICENSE`
- Contributing guide: present at `CONTRIBUTING.md`
- Code of Conduct: Contributor Covenant, present at `CODE_OF_CONDUCT.md`
- Issue templates: present under `.github/ISSUE_TEMPLATE/` plus the root fallback
  `.github/ISSUE_TEMPLATE.md`
- Pull request template: present at `.github/pull_request_template.md`
- Reported content: enabled under `Settings -> Moderation options -> Reported
  content`

Use `Prior contributors and collaborators` for reported content during the first
public phase. It satisfies GitHub's organization-owned repository community
profile check while keeping moderation intake limited to participants with a
relationship to the repository.

## Public Launch Settings

Use these repository feature settings for the first public launch:

- Visibility: public
- Issues: enabled
- Wiki: disabled
- Projects: disabled
- Discussions: disabled
- Forking: enabled
- Reported content: enabled for prior contributors and collaborators

Keep Discussions disabled until there is a clear moderation and response pattern.
Use Issues and Pull Requests as the initial public collaboration paths.

## Administrator Exception

Direct `main` changes are reserved for explicit administrator exceptions. Record the
reason in the commit message or a follow-up issue.
