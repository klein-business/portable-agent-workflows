# Public Launch Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `klein-business/portable-agent-workflows` public-ready as both a showcase reference model and a contribution-ready open-source project.

**Architecture:** Keep `.agent-work/` as the source of truth and harden only the public repository surface around it. Public documentation explains the model, community files define contribution expectations, tests prevent public-readiness drift, and GitHub settings enforce the operating model after the local changes are green.

**Tech Stack:** Markdown, Python 3.11, pytest, Ruff, uv, GitHub CLI, GitHub REST API.

---

## File Structure

| Path | Action | Responsibility |
|------|--------|----------------|
| `README.md` | Modify | Public first impression, status badges, contribution and process-history routing. |
| `CODE_OF_CONDUCT.md` | Create | Public community behavior standard and reporting route. |
| `CONTRIBUTING.md` | Modify | External contribution workflow and quality-gate expectations. |
| `SECURITY.md` | Modify | Public security reporting route and scope. |
| `CODEOWNERS` | Modify | Keep current maintainer ownership while making future org-team replacement clear. |
| `.github/ISSUE_TEMPLATE/bug_report.md` | Modify | Public issue intake with scope and verification prompts. |
| `.github/ISSUE_TEMPLATE/change_request.md` | Modify | Public model and governance change intake. |
| `.github/pull_request_template.md` | Modify | Public contribution checklist and launch-readiness guardrails. |
| `docs/admin/github-settings.md` | Modify | Public repository feature, visibility, CodeQL, and branch-protection settings. |
| `docs/overview.md` | Modify | Explain public reader path and `docs/superpowers/` process history. |
| `docs/modules/validation-tests.md` | Modify | Document new public-readiness checks. |
| `tests/test_enterprise_foundation.py` | Modify | Enforce community files, public README posture, and process-history framing. |

## Task 1: Add Failing Public-Readiness Tests

**Files:**
- Modify: `tests/test_enterprise_foundation.py`

- [ ] **Step 1: Extend required files and README links**

In `tests/test_enterprise_foundation.py`, add `CODE_OF_CONDUCT.md` to both required sets:

```python
REQUIRED_ENTERPRISE_FILES = {
    ".github/workflows/ci.yml",
    ".github/workflows/codeql.yml",
    ".github/dependabot.yml",
    ".github/pull_request_template.md",
    ".github/ISSUE_TEMPLATE/bug_report.md",
    ".github/ISSUE_TEMPLATE/change_request.md",
    "CODEOWNERS",
    "SECURITY.md",
    "CONTRIBUTING.md",
    "CHANGELOG.md",
    "LICENSE",
    "CODE_OF_CONDUCT.md",
    "docs/governance/release-policy.md",
    "docs/governance/compatibility-policy.md",
    "docs/governance/deprecation-policy.md",
    "docs/governance/adr/README.md",
    "docs/governance/adr/0001-enterprise-foundation.md",
    "docs/admin/github-settings.md",
    "docs/reference/compatibility-matrix.md",
    "tools/check_markdown_links.py",
}
```

```python
REQUIRED_README_LINKS = {
    "SECURITY.md",
    "CONTRIBUTING.md",
    "CHANGELOG.md",
    "LICENSE",
    "CODE_OF_CONDUCT.md",
    "docs/governance/release-policy.md",
    "docs/governance/compatibility-policy.md",
    "docs/governance/deprecation-policy.md",
    "docs/admin/github-settings.md",
    "docs/reference/compatibility-matrix.md",
}
```

- [ ] **Step 2: Add public README constants**

Add these constants below `OLD_REPOSITORY_NAMES`:

```python
PUBLIC_README_FORBIDDEN_PHRASES = {
    "repository-private",
    "Private repository",
}

PUBLIC_README_REQUIRED_PHRASES = {
    "Public Project Status",
    "open-source",
    "MIT",
    "CODE_OF_CONDUCT.md",
    "docs/superpowers/",
}
```

- [ ] **Step 3: Add public posture tests**

Add these tests after `test_license_is_mit`:

```python
def test_public_launch_readme_is_ready() -> None:
    readme = _read("README.md")

    for phrase in PUBLIC_README_FORBIDDEN_PHRASES:
        assert phrase not in readme, f"README.md must not contain {phrase}"

    for phrase in PUBLIC_README_REQUIRED_PHRASES:
        assert phrase in readme, f"README.md must contain {phrase}"


def test_process_history_is_explained_for_public_readers() -> None:
    overview = _read("docs/overview.md")

    assert "docs/superpowers/" in overview
    assert "design and planning history" in overview
    assert "primary reader path" in overview
```

- [ ] **Step 4: Run focused tests and verify they fail**

Run:

```bash
uv run pytest \
  tests/test_enterprise_foundation.py::test_required_enterprise_files_exist \
  tests/test_enterprise_foundation.py::test_readme_links_to_enterprise_entrypoints \
  tests/test_enterprise_foundation.py::test_public_launch_readme_is_ready \
  tests/test_enterprise_foundation.py::test_process_history_is_explained_for_public_readers \
  -v
```

Expected: failure because `CODE_OF_CONDUCT.md` does not exist, README still contains the private badge, and `docs/overview.md` does not yet explain `docs/superpowers/`.

## Task 2: Update Public Docs And Community Surface

**Files:**
- Create: `CODE_OF_CONDUCT.md`
- Modify: `README.md`
- Modify: `CONTRIBUTING.md`
- Modify: `SECURITY.md`
- Modify: `CODEOWNERS`

- [ ] **Step 1: Create `CODE_OF_CONDUCT.md`**

Create `CODE_OF_CONDUCT.md` with this content:

```markdown
# Code of Conduct

## Standard

Portable Agent Workflows is an open-source project for collaborative technical work.
Participants are expected to keep discussions focused, respectful, and useful.

Acceptable behavior includes:

- using clear technical arguments
- giving actionable feedback
- respecting different levels of project context
- keeping issue and pull request discussions on topic
- reporting sensitive concerns through private channels

Unacceptable behavior includes:

- harassment, threats, or discriminatory language
- publishing private information without consent
- repeated off-topic disruption
- bad-faith security disclosures
- personal attacks in technical review

## Reporting

Report conduct concerns to the maintainers listed in `CODEOWNERS`. If the report
contains sensitive security information, use the private security route described in
`SECURITY.md`.

Do not open public issues for personal safety reports or sensitive vulnerability
details.

## Enforcement

Maintainers may edit, hide, or remove comments; close issues; block accounts; or
limit participation when behavior harms the project. Enforcement should be
proportional, documented privately when needed, and focused on keeping the project
usable for contributors.
```

- [ ] **Step 2: Replace the private README badge**

In `README.md`, replace:

```html
<img alt="Private repository" src="https://img.shields.io/badge/repository-private-111827?style=for-the-badge">
```

with:

```html
<img alt="Public repository" src="https://img.shields.io/badge/repository-public-111827?style=for-the-badge">
```

- [ ] **Step 3: Add public project status to README**

Insert this section after `## What This Repository Is Not`:

```markdown
## Public Project Status

Portable Agent Workflows is a public, MIT-licensed, open-source reference model.
It is ready for evaluation, issues, and focused pull requests that improve the
`agent-work-v1` model, documentation, validation, or generated harness entrypoints.

The main reader path is this README, then `docs/overview.md`, then the `.agent-work/`
source artifacts. `docs/superpowers/` records design and planning history; it is
kept for transparency, not as the primary product documentation path.
```

- [ ] **Step 4: Add Code of Conduct to README enterprise readiness**

In `README.md`, add this bullet under `## Enterprise Readiness`:

```markdown
- Community standards are documented in [CODE_OF_CONDUCT.md][code-of-conduct].
```

- [ ] **Step 5: Add Code of Conduct link reference**

In the README link reference block, add:

```markdown
[code-of-conduct]: CODE_OF_CONDUCT.md
```

- [ ] **Step 6: Add process history to README included list**

In `README.md`, add this bullet under `## What Is Included`:

```markdown
- `docs/superpowers/` records design and planning history for major changes.
```

- [ ] **Step 7: Update `CONTRIBUTING.md` public expectations**

Append this section to `CONTRIBUTING.md`:

```markdown
## Public Contribution Expectations

Issues and pull requests should stay focused on the portable workflow model,
generated harness integrations, validation, documentation, governance, and supported
adapter behavior.

Before opening a pull request:

1. Check whether the change affects `agent-work-v1` compatibility.
2. Update tests or documentation with the change.
3. Run the required local checks.
4. Link any related issue or design discussion.

Behavior expectations are defined in `CODE_OF_CONDUCT.md`.
```

- [ ] **Step 8: Update `SECURITY.md` public reporting language**

Replace the first paragraph under `## Reporting A Vulnerability` with:

```markdown
Do not open a public issue for vulnerabilities. Report security concerns through a
private GitHub security advisory for this repository. If advisories are unavailable,
contact the current maintainers listed in `CODEOWNERS` and request a private
reporting channel.
```

- [ ] **Step 9: Update `CODEOWNERS` maintainership comment**

Replace the first line of `CODEOWNERS` with:

```text
# Initial ownership map. Replace @flitzrrr with an organization team when one exists.
```

If that line already matches, leave it unchanged.

- [ ] **Step 10: Run focused public tests and verify they pass**

Run:

```bash
uv run pytest \
  tests/test_enterprise_foundation.py::test_required_enterprise_files_exist \
  tests/test_enterprise_foundation.py::test_readme_links_to_enterprise_entrypoints \
  tests/test_enterprise_foundation.py::test_public_launch_readme_is_ready \
  tests/test_enterprise_foundation.py::test_process_history_is_explained_for_public_readers \
  -v
```

Expected: all selected tests pass.

## Task 3: Update Public Intake And Admin Documentation

**Files:**
- Modify: `.github/ISSUE_TEMPLATE/bug_report.md`
- Modify: `.github/ISSUE_TEMPLATE/change_request.md`
- Modify: `.github/pull_request_template.md`
- Modify: `docs/admin/github-settings.md`
- Modify: `docs/overview.md`

- [ ] **Step 1: Update bug report template**

Append this section to `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
## Public Contribution Check

- [ ] I did not include secrets, private keys, or sensitive vulnerability details.
- [ ] I checked the current README and documentation path first.
```

- [ ] **Step 2: Update change request template**

Append this section to `.github/ISSUE_TEMPLATE/change_request.md`:

```markdown
## Public Readiness

- [ ] This change keeps the repository understandable for first-time readers.
- [ ] This change preserves or updates the public compatibility story.
```

- [ ] **Step 3: Update pull request template**

Add this checklist block after `## Scope` in `.github/pull_request_template.md`:

```markdown
## Public Surface

- [ ] README, docs, and generated entrypoints remain accurate for public readers.
- [ ] Community, security, and contribution routes remain intact.
- [ ] `docs/superpowers/` changes are design or planning history, not primary product documentation.
```

- [ ] **Step 4: Add public launch settings to GitHub admin docs**

In `docs/admin/github-settings.md`, add this section before `## Administrator Exception`:

```markdown
## Public Launch Settings

Use these repository feature settings for the first public launch:

- Visibility: public
- Issues: enabled
- Wiki: disabled
- Projects: disabled
- Discussions: disabled
- Forking: enabled

Keep Discussions disabled until there is a clear moderation and response pattern.
Use Issues and Pull Requests as the initial public collaboration paths.
```

- [ ] **Step 5: Add process-history explanation to overview**

In `docs/overview.md`, add this section before `## References`:

```markdown
## Process History

`docs/superpowers/` contains design and planning history for significant repository
changes. It is kept for transparency and handover continuity. The primary reader
path remains `README.md`, this overview, `docs/reference/compatibility-matrix.md`,
`.agent-work/glossary.md`, and `.agent-work/skills/`.
```

- [ ] **Step 6: Run focused tests and Markdown link check**

Run:

```bash
uv run pytest tests/test_enterprise_foundation.py -v
uv run python tools/check_markdown_links.py
```

Expected: all enterprise foundation tests pass and all local Markdown links resolve.

## Task 4: Refresh Validation Documentation

**Files:**
- Modify: `docs/modules/validation-tests.md`

- [ ] **Step 1: Capture updated test symbol locations**

Run:

```bash
nl -ba tests/test_enterprise_foundation.py | sed -n '1,240p'
```

Expected: output shows the updated constants and the new public-readiness tests.

- [ ] **Step 2: Update validation module overview**

In `docs/modules/validation-tests.md`, replace the overview sentence with:

```markdown
The validation-tests module verifies that the Markdown artifacts remain structurally coherent. It checks required glossary terms, adapter sections, skill metadata, gate definitions, generated harness currentness, example lifecycle frontmatter, enterprise foundation files, public-readiness files, and license metadata.
```

- [ ] **Step 3: Update enterprise foundation key symbol descriptions**

In `docs/modules/validation-tests.md`, update the `tests/test_enterprise_foundation.py` rows so they include:

```markdown
| `PUBLIC_README_FORBIDDEN_PHRASES` | const | internal | `tests/test_enterprise_foundation.py` | Lists private-readiness phrases forbidden in the public README. |
| `PUBLIC_README_REQUIRED_PHRASES` | const | internal | `tests/test_enterprise_foundation.py` | Lists public-readiness phrases required in the public README. |
| `test_public_launch_readme_is_ready` | function | internal | `tests/test_enterprise_foundation.py` | Verifies README.md presents the repository as public, open-source, and contribution-ready. |
| `test_process_history_is_explained_for_public_readers` | function | internal | `tests/test_enterprise_foundation.py` | Verifies docs explain `docs/superpowers/` as design and planning history. |
```

Keep the existing rows for `REQUIRED_ENTERPRISE_FILES`, `REQUIRED_README_LINKS`,
`test_required_enterprise_files_exist`, and related tests, updating their
descriptions to mention `CODE_OF_CONDUCT.md` and public-readiness checks.

- [ ] **Step 4: Update Enterprise Foundation Validation bullets**

In `docs/modules/validation-tests.md`, ensure the Enterprise Foundation Validation
list contains these bullets:

```markdown
- required enterprise and public community files exist
- README links to governance, security, contribution, license, code of conduct, admin, and reference entrypoints
- README does not present the repository as private
- public process history is clearly framed for readers
- compatibility matrix covers all supported adapters
- `.agent-work` artifacts retain required frontmatter and `agent-work-v1`
- governance documents define release, compatibility, deprecation, and GitHub settings rules
- the root license is MIT
- Markdown files do not reference the old repository name
```

- [ ] **Step 5: Run docs checks**

Run:

```bash
uv run python tools/check_markdown_links.py
git diff --check
```

Expected: all local Markdown links resolve and no whitespace errors are reported.

## Task 5: Run Full Local Verification And Commit Public Surface

**Files:**
- Verify all modified files from Tasks 1 through 4.

- [ ] **Step 1: Run full quality gates**

Run:

```bash
uv run python tools/generate_harness_integrations.py --check
uv run pytest tests/ -v
uv run ruff check tests/ tools/
uv run ruff format --check tests/ tools/
uv run python tools/check_markdown_links.py
git diff --check
```

Expected:

```text
Generated harness files are current.
15 or more tests passed
All checks passed!
files already formatted
Checked ... Markdown files; local links resolve.
```

- [ ] **Step 2: Inspect the diff**

Run:

```bash
git diff --stat
git diff -- README.md CODE_OF_CONDUCT.md CONTRIBUTING.md SECURITY.md CODEOWNERS .github docs tests
```

Expected: only public-launch documentation, community files, admin docs, and validation tests changed.

- [ ] **Step 3: Commit the public surface changes**

Run:

```bash
git add README.md CODE_OF_CONDUCT.md CONTRIBUTING.md SECURITY.md CODEOWNERS \
  .github/ISSUE_TEMPLATE/bug_report.md \
  .github/ISSUE_TEMPLATE/change_request.md \
  .github/pull_request_template.md \
  docs/admin/github-settings.md \
  docs/overview.md \
  docs/modules/validation-tests.md \
  tests/test_enterprise_foundation.py
git commit -m "docs: prepare public launch surface"
```

Expected: commit succeeds.

## Task 6: Push And Verify GitHub Checks

**Files:**
- No repository file changes.
- GitHub Actions runs on `main`.

- [ ] **Step 1: Push main**

Run:

```bash
git push origin main
```

Expected: `main -> main` push succeeds.

- [ ] **Step 2: Capture latest runs**

Run:

```bash
gh run list --repo klein-business/portable-agent-workflows --branch main --limit 8
```

Expected: new `CI`, `CodeQL`, and dependency graph runs appear for the new commit.

- [ ] **Step 3: Watch required runs**

Run:

```bash
for run_id in $(gh run list \
  --repo klein-business/portable-agent-workflows \
  --branch main \
  --limit 8 \
  --json databaseId,status \
  --jq '.[] | select(.status == "queued" or .status == "in_progress") | .databaseId'); do
  gh run watch "$run_id" --repo klein-business/portable-agent-workflows --exit-status
done
```

Expected: each queued or in-progress run completes with `success`. If the command
prints nothing, all latest runs have already completed.

- [ ] **Step 4: Verify branch is clean**

Run:

```bash
git status --short --branch
```

Expected:

```text
## main...origin/main
```

## Task 7: Configure GitHub Repository Settings And Make Public

**Files:**
- No repository file changes.
- GitHub repository settings are changed through `gh`.

- [ ] **Step 1: Verify current metadata before changing visibility**

Run:

```bash
gh repo view klein-business/portable-agent-workflows \
  --json name,owner,visibility,isPrivate,description,repositoryTopics,licenseInfo,defaultBranchRef,url
```

Expected: repository is private, default branch is `main`, license is MIT.

- [ ] **Step 2: Set non-visibility feature flags**

Run:

```bash
gh repo edit klein-business/portable-agent-workflows \
  --enable-issues=true \
  --enable-projects=false \
  --enable-wiki=false \
  --enable-discussions=false \
  --allow-forking
```

Expected: command exits successfully.

- [ ] **Step 3: Make the repository public**

Run only after confirming the user still wants the visibility change in the current
thread:

```bash
gh repo edit klein-business/portable-agent-workflows \
  --visibility public \
  --accept-visibility-change-consequences
```

Expected: command exits successfully.

- [ ] **Step 4: Apply branch protection to `main`**

Run:

```bash
cat >/tmp/portable-agent-workflows-main-protection.json <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "validate"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1,
    "require_last_push_approval": false,
    "required_review_thread_resolution": true
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": true
}
JSON

gh api \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  repos/klein-business/portable-agent-workflows/branches/main/protection \
  --input /tmp/portable-agent-workflows-main-protection.json
```

Expected: GitHub returns branch protection JSON for `main`.

- [ ] **Step 5: Verify final repository settings**

Run:

```bash
gh api repos/klein-business/portable-agent-workflows --jq '{
  private,
  visibility,
  has_issues,
  has_projects,
  has_wiki,
  has_discussions,
  allow_forking,
  default_branch,
  license
}'
```

Expected:

```json
{
  "private": false,
  "visibility": "public",
  "has_issues": true,
  "has_projects": false,
  "has_wiki": false,
  "has_discussions": false,
  "allow_forking": true,
  "default_branch": "main",
  "license": {
    "key": "mit"
  }
}
```

- [ ] **Step 6: Verify branch protection**

Run:

```bash
gh api repos/klein-business/portable-agent-workflows/branches/main/protection --jq '{
  required_status_checks,
  required_pull_request_reviews,
  allow_force_pushes,
  allow_deletions
}'
```

Expected: required status checks include `validate`, pull request reviews require one approval and code owner review, force pushes and deletions are disabled.

## Task 8: Verify Public Launch State

**Files:**
- No repository file changes.

- [ ] **Step 1: Verify Community Profile**

Run:

```bash
gh api repos/klein-business/portable-agent-workflows/community/profile --jq '{
  health_percentage,
  files
}'
```

Expected: `files` includes README, license, contributing, security, pull request
template, issue template, and code of conduct. `health_percentage` should be at or
near 100 based on GitHub's current scoring for this repository.

- [ ] **Step 2: Verify latest GitHub runs after public switch**

Run:

```bash
gh run list --repo klein-business/portable-agent-workflows --branch main --limit 8
```

Expected: latest runs for the current `main` commit are completed with `success`.

- [ ] **Step 3: Verify public URL**

Run:

```bash
gh repo view klein-business/portable-agent-workflows --web
```

Expected: browser opens `https://github.com/klein-business/portable-agent-workflows`.

- [ ] **Step 4: Record final status for the user**

Report:

```text
Public URL: https://github.com/klein-business/portable-agent-workflows
Visibility: public
License: MIT
Current main checks: green
Branch protection: active on main
Issues: enabled
Wiki: disabled
Projects: disabled
Discussions: disabled
```

Also report any GitHub API limitation encountered while applying branch protection
or community profile settings.
