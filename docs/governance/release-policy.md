# Release Policy

## Versioning

Repository releases follow SemVer:

- patch releases fix documentation, validation, or generated-output defects
- minor releases add compatible skills, adapters, governance, or validation
- major releases contain repository-level breaking changes

The portable domain model version is tracked separately. The current domain version
is `agent-work-v1`.

## Release Gates

A release requires:

- all required CI checks passing
- generated harness files verified current
- Markdown links verified
- compatibility impact recorded in the pull request
- `CHANGELOG.md` updated
- migration notes for breaking changes
- ADR for breaking changes to model, skill, adapter, or generated-entrypoint contracts

## Release Steps

1. Confirm `main` is green.
2. Update `CHANGELOG.md`.
3. Tag the release with the SemVer version.
4. Publish GitHub release notes from the changelog entry.
5. Record follow-up deprecations or migrations as issues.
