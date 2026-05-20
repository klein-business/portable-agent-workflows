---
type: spec
status: approved
created: 2026-05-20
updated: 2026-05-20
---

# Enterprise Foundation Design

## Context

Portable Agent Workflows is a small documentation-and-artifact repository. It defines
the `agent-work-v1` domain model, portable skills, harness adapters, generated native
entrypoints, and structural tests. The repository is coherent, but it is not yet
operated at enterprise level: governance, compatibility rules, supply-chain checks,
security documentation, release discipline, and PR-first operating rules are not yet
explicit enough.

The repository should become suitable for both external professional review and
internal enterprise operation without turning the project into a heavy compliance
system.

## Goal

Create an Enterprise Foundation Slice that hardens the repository and the portable
model while keeping the current V1 behavior intact.

The foundation should make these things explicit:

- how changes enter the repository
- which checks must pass
- how compatibility is defined and protected
- how breaking changes are proposed and documented
- how releases, deprecations, and migrations are handled
- how security issues and contributions are routed
- which GitHub repository settings should be enabled by an administrator

## Selected Approach

Use a combined governance and quality-gates approach.

This approach adds enterprise repository artifacts, CI and supply-chain checks,
compatibility documentation, ADR structure, and stronger model validation in one
bounded slice. It avoids adding new product features or changing the `agent-work-v1`
semantics.

Rejected alternatives:

- Governance-only hardening would improve professionalism but would not catch drift
  in `.agent-work` artifacts.
- Quality-gates-only hardening would improve technical confidence but would leave
  compatibility, release, and contribution rules underdefined.

## Scope

In scope:

- PR-first governance as the documented operating model.
- CI and supply-chain baseline for the repository.
- Security, contribution, release, compatibility, and deprecation documentation.
- GitHub settings documented as reproducible administrator instructions.
- ADR structure for major decisions and breaking changes.
- Stronger validation for `.agent-work` model and enterprise artifacts.
- README and documentation updates that make enterprise readiness visible.

Out of scope:

- New V1.1 product features.
- Automatic mutation of GitHub branch protection or rulesets through API calls.
- SBOM generation.
- SLSA provenance.
- Signed commits or signed releases.
- New supported agent harnesses.
- Runtime package publication.

## Repository Artifacts

Add or update these artifacts:

- `.github/workflows/ci.yml`
- `.github/workflows/codeql.yml`
- `.github/dependabot.yml`
- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/`
- `CODEOWNERS`
- `SECURITY.md`
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- `docs/governance/release-policy.md`
- `docs/governance/compatibility-policy.md`
- `docs/governance/deprecation-policy.md`
- `docs/governance/adr/README.md`
- `docs/governance/adr/0001-enterprise-foundation.md`
- `docs/admin/github-settings.md`
- `docs/reference/compatibility-matrix.md`

Update existing documentation:

- `README.md`
- `docs/overview.md`
- relevant module and feature documentation
- validation test documentation

`.agent-work/` remains the source of truth for the domain model, skills, adapters,
and lifecycle example. Governance documentation explains how to change those
artifacts, but it does not replace them.

## Governance Model

The repository should document a hard PR-first workflow:

1. Work happens on a project-oriented branch.
2. Changes are proposed through a pull request.
3. Required checks must pass before merge.
4. Review is required before merge.
5. Stale approvals are dismissed when the branch changes.
6. Direct `main` changes are reserved for explicit administrator exceptions.

`CODEOWNERS` assigns review ownership for:

- `.agent-work/`
- `tools/`
- `tests/`
- `.github/`
- `docs/governance/`
- root policy files

The first implementation documents GitHub settings in
`docs/admin/github-settings.md`; it does not apply them automatically.

## Compatibility Model

The project uses strict enterprise compatibility rules:

- Repository releases follow SemVer.
- The portable domain model keeps an explicit domain version, currently
  `agent-work-v1`.
- Breaking changes to domain terms, gates, artifact kinds, skill contracts, adapter
  contracts, or generated entrypoint expectations require an ADR.
- Breaking changes require either a new domain version or a migration guide that
  explains why the domain version can remain stable.
- Deprecations must be documented before removal.
- Harness support is tracked in `docs/reference/compatibility-matrix.md`.

The compatibility matrix covers Codex, OpenCode, Claude Code, and Cursor. It records
the supported entrypoints, adapter status, generated-file status, and stability
level for each harness.

## CI And Supply Chain

`ci.yml` should run the same checks expected locally:

- `uv sync --dev`
- `uv run python tools/generate_harness_integrations.py --check`
- `uv run pytest tests/ -v`
- `uv run ruff check tests/ tools/`
- `uv run ruff format --check tests/ tools/`
- Markdown link validation through a lightweight repository-owned script or test

`codeql.yml` should enable CodeQL for relevant surfaces, especially Python and
GitHub Actions configuration.

`dependabot.yml` should cover:

- GitHub Actions updates
- Python or uv dependency updates, where supported cleanly by Dependabot

The first slice does not include SBOM, SLSA, or signing. Those remain future
hardening topics.

## Model Validation

Extend the existing lightweight validation style. Tests should remain dependency-light
and should continue to use repository files as the source of truth.

Additional checks should verify:

- required governance and policy files exist
- README links to CI, security, contribution, compatibility, and governance docs
- compatibility matrix covers all supported adapters
- every `.agent-work` artifact has the expected frontmatter where applicable
- adapter and skill metadata remains aligned with the glossary
- generated native harness files remain current
- governance docs do not reference unsupported harnesses or old repository names

The implementation may use small test helpers for Markdown link validation and
frontmatter checks. A full YAML or Markdown AST parser is not required for this slice.

## Documentation Design

The README becomes the entry point for both users and maintainers. It should make
these sections easy to find:

- What this repository is
- What this repository is not
- Origins
- Enterprise readiness
- Quickstart
- Quality gates
- Documentation index
- Supported harnesses
- Contribution and security paths

Documentation should be grouped clearly:

- `docs/governance/` for operating rules
- `docs/reference/` for compatibility and stable reference material
- `docs/admin/` for repository administration settings
- `docs/modules/` for implementation inventory
- `docs/features/` for user-visible behavior

Governance documents should be concise and enforceable. They should explain the rule,
the reason, and the expected action.

## Error Handling And Failure Modes

If CI cannot run a check because a dependency or GitHub feature is unavailable, the
failure should be explicit. The workflow should not silently skip required checks.

If a proposed change affects compatibility but does not include an ADR, migration
note, or deprecation path, validation or PR review should block the change.

If GitHub branch protection is not configured yet, the repository still contains the
documented settings needed for an administrator to enable it consistently.

## Verification

Run:

```bash
uv run python tools/generate_harness_integrations.py --check
uv run pytest tests/ -v
uv run ruff check tests/ tools/
uv run ruff format --check tests/ tools/
```

Also run the repository Markdown link validation and `git diff --check` before
claiming completion.

## Definition Of Done

The Enterprise Foundation Slice is complete when:

- all planned governance, admin, reference, policy, and workflow files exist
- README and docs link the new structure clearly
- CI and supply-chain workflows are committed
- tests cover enterprise artifacts and model conformance
- `agent-work-v1` semantics are unchanged
- old repository-name references are absent
- local verification passes
- the final implementation is committed and pushed

## Open Decisions

No open design decisions remain for this foundation slice.
