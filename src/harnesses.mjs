export const ALL_HARNESSES = Object.freeze([
  {
    id: "codex",
    displayName: "Codex",
    stability: "stable",
    files: Object.freeze([".agent-work", "AGENTS.md"]),
  },
  {
    id: "claude",
    displayName: "Claude Code",
    stability: "stable",
    files: Object.freeze([".agent-work", "CLAUDE.md", ".claude/commands/shape-idea.md"]),
  },
  {
    id: "cursor",
    displayName: "Cursor",
    stability: "stable",
    files: Object.freeze([".agent-work", ".cursor/rules/agent-work.mdc"]),
  },
  {
    id: "opencode",
    displayName: "OpenCode",
    stability: "documented",
    files: Object.freeze([".agent-work", "AGENTS.md", ".opencode/commands/shape-idea.md"]),
  },
]);

export const HARNESS_IDS = Object.freeze(ALL_HARNESSES.map((harness) => harness.id));

export function resolveHarnesses(value) {
  const requested = value ? value.split(",").map((item) => item.trim()).filter(Boolean) : HARNESS_IDS;
  const selected = [];
  const seen = new Set();

  for (const id of requested) {
    const harness = ALL_HARNESSES.find((candidate) => candidate.id === id);
    if (!harness) {
      throw new Error(`Unknown harness: ${id}`);
    }
    if (!seen.has(id)) {
      seen.add(id);
      selected.push(harness);
    }
  }

  return selected;
}

export function filesForHarnesses(harnesses) {
  return [...new Set(harnesses.flatMap((harness) => harness.files))];
}
