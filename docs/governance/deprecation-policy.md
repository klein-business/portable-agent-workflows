# Deprecation Policy

## Deprecation Notice

A Deprecation Notice is required before removing or replacing a stable model,
skill, adapter, gate, generated entrypoint, or governance contract.

The notice must include:

- deprecated surface
- replacement
- reason
- first release or commit where the deprecation appears
- earliest removal point
- migration steps

## Deprecation Period

Deprecations remain documented for at least one minor release cycle after the notice
is introduced.

## Removal

Removal requires:

- compatibility policy review
- ADR when the removal is breaking
- migration guide
- changelog entry
- updated validation tests

## Migration

Migration instructions must use exact file paths and validation commands. If no
automatic migration exists, the policy must state the manual steps.
