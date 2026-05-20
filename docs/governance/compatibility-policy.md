# Compatibility Policy

## Stable Surface

The stable surface includes:

- `agent-work-v1` domain terms
- gate names in `.agent-work/glossary.md`
- artifact kinds in `.agent-work/glossary.md`
- portable skill frontmatter contracts
- adapter role and capability mappings
- generated harness entrypoint expectations

## Breaking Change

A Breaking Change is any change that requires existing users or future agents to
change their artifacts, skill invocations, adapter assumptions, generated harness
files, or validation expectations.

Breaking changes require:

- an ADR under `docs/governance/adr/`
- a migration guide or migration section in the release notes
- compatibility matrix update
- deprecation notice when removal is delayed

## Compatible Changes

Compatible changes include:

- adding a new optional skill input
- adding a new adapter note without changing existing mappings
- adding validation for documented existing behavior
- adding new documentation that does not alter contracts

## Domain Version Rules

The current domain version is `agent-work-v1`.

A breaking domain change requires either:

- a new domain version such as `agent-work-v2`, or
- an ADR explaining why the change can remain within `agent-work-v1`

## Migration Guide

A migration guide must state:

- affected artifacts
- old behavior
- new behavior
- exact steps to migrate
- validation commands that prove migration completed
