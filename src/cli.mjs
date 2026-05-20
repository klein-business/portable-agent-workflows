import { ALL_HARNESSES } from "./harnesses.mjs";

export function printHelp(stdout) {
  stdout.write(`portable-agent-workflows

Usage:
  portable-agent-workflows init [--harness codex,claude,cursor,opencode] [--target path] [--yes] [--dry-run] [--force]
  portable-agent-workflows check [--harness codex,claude,cursor,opencode] [--target path]
  portable-agent-workflows list-harnesses

Commands:
  init            Install project-local portable workflow files
  check           Verify installed files against this package
  list-harnesses  List supported harness IDs
`);
}

export function listHarnesses(stdout) {
  for (const harness of ALL_HARNESSES) {
    stdout.write(`${harness.id}\t${harness.displayName}\t${harness.stability}\n`);
  }
}

export async function main(args, io) {
  const [command = "--help"] = args;

  if (command === "--help" || command === "-h") {
    printHelp(io.stdout);
    return 0;
  }

  if (command === "list-harnesses") {
    listHarnesses(io.stdout);
    return 0;
  }

  if (command === "init" || command === "check") {
    io.stderr.write(`${command} is not implemented yet; a later task will add ${command} internals.\n`);
    return 2;
  }

  io.stderr.write(`Unknown command: ${command}\n`);
  return 2;
}
