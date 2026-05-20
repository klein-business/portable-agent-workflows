# 0001: Enterprise Foundation

## Status

Accepted

## Context

Portable Agent Workflows has a coherent `agent-work-v1` model, generated harness
entrypoints, and structural tests. It needs enterprise-grade operating rules without
adding product features or changing model semantics.

## Decision

Adopt an Enterprise Foundation Slice with:

- PR-first governance
- CI validation
- CodeQL workflow
- Dependabot configuration
- compatibility policy
- release policy
- deprecation policy
- ADR process
- documented GitHub settings
- compatibility matrix
- stronger model validation

## Consequences

The repository gains clear operating rules and stronger validation. Some future
changes require ADRs and migration notes before merge.

## Compatibility Impact

No `agent-work-v1` semantics change. This ADR adds governance around existing stable
surfaces.
