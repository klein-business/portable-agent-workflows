# Distribution

Portable Agent Workflows is distributed as project-local agent workflow artifacts.
The npm package is an initializer, not a runtime framework.

## Quickstart

```bash
npx portable-agent-workflows init --harness codex,claude,cursor,opencode --yes
npx portable-agent-workflows check
```

## Preview Changes

```bash
npx portable-agent-workflows init --harness codex,claude --dry-run
```

`--dry-run` prints planned file actions without writing files.

## Overwrite Policy

Existing workflow files are not overwritten by default. Use `--force` only after
reviewing the planned changes:

```bash
npx portable-agent-workflows init --harness codex --force
```

The install manifest is the exception. On every non-dry-run install, the
initializer writes `.agent-work/install.json` with the selected harnesses and
installed file list so `check` can verify that exact project-local install later.

## Installed Files

The installer writes project-local files such as:

- `.agent-work/`
- `AGENTS.md`
- `CLAUDE.md`
- `.claude/commands/shape-idea.md`
- `.cursor/rules/agent-work.mdc`
- `.opencode/commands/shape-idea.md`

## Safety Boundary

The installer does not write to global Codex, Claude, Cursor, OpenCode, Git, or
GitHub settings. It does not write to global dotfiles such as `~/.codex`,
`~/.claude`, or global Cursor settings. It does not create Git commits or mutate
GitHub repository settings.

## Deferred Channels

Phase 1 intentionally does not publish a PyPI package, Homebrew formula, Docker
image, VS Code or Cursor extension, MCP server, or global installer. Those
channels are future candidates after the project-local installer contract is
proven.

## Manual Publishing Checklist

Publishing is manual. The project does not automatically publish npm packages or
GitHub releases from CI.

1. Confirm `main` is green.
2. Confirm `CHANGELOG.md` includes the release entry.
3. Run `npm run check:node`.
4. Run the Python validation gates from the README.
5. Run `npm pack --json` and inspect package contents.
6. Run the local tarball smoke test in a clean temporary repository:

   ```bash
   npm exec --yes --package ./portable-agent-workflows-0.1.0.tgz -- portable-agent-workflows init --harness codex,claude,cursor,opencode --yes
   npm exec --yes --package ./portable-agent-workflows-0.1.0.tgz -- portable-agent-workflows check
   ```

7. Publish npm manually with `npm publish --access public`.
8. Tag the release with `git tag v0.1.0`.
9. Push the tag with `git push origin v0.1.0`.
10. Publish GitHub release notes from `CHANGELOG.md`.
