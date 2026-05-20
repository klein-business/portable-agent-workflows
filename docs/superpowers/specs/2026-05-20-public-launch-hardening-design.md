---
type: spec
status: approved
created: 2026-05-20
updated: 2026-05-20
---

# Public Launch Hardening Design

## Context

Portable Agent Workflows is currently a private repository under
`klein-business/portable-agent-workflows`. It already has a coherent domain model,
generated harness integrations, enterprise governance documents, MIT licensing, CI,
CodeQL default setup, Dependabot, and structural validation.

The next goal is to make the repository public as both:

- a showcase and reference model for portable agent workflows
- a contribution-ready open-source project

The repository is close to public-ready, but a direct visibility switch would expose
some unfinished public-facing details: the README still marks the repository as
private, branch protection is not active, GitHub Community Profile is incomplete,
repository features are not curated, and internal planning history is present without
clear public framing.

## Goal

Prepare the repository for a credible public launch without changing the
`agent-work-v1` domain semantics.

The launch should make the repository look intentional to first-time readers,
safe enough for external contributors, and easy to verify through local and GitHub
quality gates.

## Selected Approach

Use a curated public launch hardening slice.

This combines documentation polish, community files, public-readiness validation,
and GitHub repository settings before changing visibility to public.

Rejected alternatives:

- Immediate public release is technically possible, but it would expose private
  badges, missing branch protection, and incomplete community metadata.
- Minimal hygiene would remove the obvious issues, but it would not make the
  repository strong enough for both showcase use and external contributions.

## Scope

In scope:

- Update public-facing README positioning.
- Add missing community metadata such as a code of conduct.
- Keep MIT license, CI, CodeQL, Dependabot, security, and contribution paths visible.
- Clarify that `docs/superpowers/` contains design and planning history, not the
  primary reader path.
- Update validation tests so public-readiness basics stay enforced.
- Configure repository settings for public launch.
- Change repository visibility to public after validation passes.
- Verify current GitHub checks and repository metadata after the visibility change.

Out of scope:

- Changing the `agent-work-v1` domain model.
- Adding new portable skills.
- Adding runtime packaging or an installer.
- Creating a marketing site.
- Publishing to a package registry.
- Enabling Discussions before there is a clear community moderation plan.
- Removing historical design and planning files solely for cosmetic reasons.

## Public Positioning

The README should present Portable Agent Workflows as a public, MIT-licensed,
harness-agnostic workflow model for coding agents. It should support two readers:

- evaluators who want to understand the model quickly
- contributors who want to propose improvements safely

The first screen should no longer communicate "private repository". It should
communicate public availability, quality gates, supported harnesses, MIT license,
and contribution readiness.

The origins section should remain transparent about the influence of
`obra/superpowers` and `DasDigitaleMomentum/opencode-processing-skills`, but the
repository should be framed as a clean new `agent-work-v1` domain model rather than
as a mechanical combination of those projects.

## Community And Governance

The repository should be contribution-ready before it is public.

Required community and governance artifacts:

- `README.md`
- `LICENSE`
- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/change_request.md`
- `CODEOWNERS`
- `docs/admin/github-settings.md`

`CODEOWNERS` and security routing may start with the current maintainer, but the
files should be written so an organization team can replace that owner cleanly later.

The GitHub Community Profile should be checked after the changes and should be as
complete as GitHub supports for this repository type.

## Repository Settings

Before or during the public launch, configure GitHub settings intentionally:

- Visibility: public.
- Issues: enabled.
- Wiki: disabled.
- Projects: disabled.
- Discussions: disabled for the first public launch.
- Default branch: `main`.
- Branch protection or ruleset for `main`.
- Force pushes: blocked.
- Branch deletions: blocked.

Branch protection or a ruleset should require:

- pull request before merge
- at least one approval when normal contribution flow begins
- required status check `validate`
- branch up to date before merge where available
- code owner review when CODEOWNERS is active

CodeQL default setup should remain the active code scanning path. The checked-in
advanced CodeQL workflow should stay manual-only unless default setup is disabled.

## Documentation Structure

The main public reader path should be:

1. `README.md`
2. `docs/overview.md`
3. `docs/reference/compatibility-matrix.md`
4. `.agent-work/glossary.md`
5. `.agent-work/skills/`

`docs/superpowers/` should remain in the repository as design and planning history.
It should be framed explicitly so it does not look like the main product
documentation tree.

The README should keep the enterprise-readiness section, but the tone should be
public and open-source oriented rather than private-enterprise oriented.

## Validation

Extend `tests/test_enterprise_foundation.py` or a focused public-readiness test so
these conditions are enforced:

- `CODE_OF_CONDUCT.md` exists.
- README no longer contains a private-repository badge.
- README references public/contribution/license/security entrypoints.
- Public launch documentation explains the role of `docs/superpowers/`.
- Required community files remain present.

Existing validation remains required:

```bash
uv run python tools/generate_harness_integrations.py --check
uv run pytest tests/ -v
uv run ruff check tests/ tools/
uv run ruff format --check tests/ tools/
uv run python tools/check_markdown_links.py
git diff --check
```

## Implementation Sequence

1. Update public-facing docs and community files.
2. Add public-readiness validation.
3. Run local quality gates.
4. Commit and push documentation and validation changes.
5. Configure GitHub repository settings.
6. Change repository visibility to public.
7. Wait for GitHub CI, CodeQL, and dependency graph checks.
8. Verify repository metadata through GitHub API.
9. Report final public URL, checks, and any residual follow-up items.

## Acceptance Criteria

- Repository visibility is public.
- README no longer presents the repository as private.
- GitHub license metadata reports MIT.
- GitHub Community Profile includes README, license, contributing, security,
  issue template, pull request template, and code of conduct.
- Current GitHub checks on `main` are green.
- Branch protection or an equivalent ruleset protects `main`.
- Wiki and Projects are disabled unless deliberately re-enabled later.
- Issues are enabled.
- Discussions remain disabled for the first public launch.
- Local quality gates pass.
- No public-facing documentation describes public launch state ambiguously.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Public launch exposes rough process history. | Keep `docs/superpowers/`, but label it as design and planning history. |
| Branch protection setup differs by GitHub plan or API behavior. | Prefer repository rulesets where available; fall back to branch protection if needed. |
| Required CodeQL checks differ from default setup names. | Require `validate` first; document CodeQL default setup as repository security telemetry unless stable required check names are confirmed. |
| Public contributions arrive before moderation process is mature. | Keep Discussions disabled initially and route interaction through Issues and PRs. |
| CODEOWNERS points to one maintainer. | Keep it functional now and document that an organization team can replace it. |

## Non-Goals For First Public Launch

- No package publication.
- No website.
- No installer.
- No new harness support.
- No signed release requirement.
- No SBOM or SLSA provenance requirement.

## Open Decisions

No open design decisions remain. The selected path is the curated public launch
hardening slice with public visibility applied after documentation, validation, and
repository settings are ready.
