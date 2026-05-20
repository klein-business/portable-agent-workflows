import { ALL_HARNESSES } from "./harnesses.mjs";

const NOT_IMPLEMENTED_MODULES = new Map([
  ["init", { path: "./install.mjs", exportName: "runInit" }],
  ["check", { path: "./check.mjs", exportName: "runCheck" }],
]);

export function parseArgs(args, defaults = {}) {
  const options = {
    command: "help",
    harness: undefined,
    target: defaults.cwd ?? process.cwd(),
    yes: false,
    dryRun: false,
    force: false,
    help: false,
  };

  const remaining = [...args];
  if (remaining.length > 0 && !remaining[0].startsWith("-")) {
    options.command = remaining.shift();
  }

  while (remaining.length > 0) {
    const arg = remaining.shift();
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--harness") {
      options.harness = readOptionValue(arg, remaining);
    } else if (arg === "--target") {
      options.target = readOptionValue(arg, remaining);
    } else if (arg === "--yes" || arg === "-y") {
      options.yes = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--force") {
      options.force = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (options.command === "help") {
    options.help = true;
  }

  return options;
}

function readOptionValue(option, remaining) {
  const value = remaining.shift();
  if (value === undefined || value.startsWith("-")) {
    throw new Error(`Missing value for ${option}`);
  }
  return value;
}

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
  try {
    const options = parseArgs(args, { cwd: io.cwd });

    if (options.help) {
      printHelp(io.stdout);
      return 0;
    }

    if (options.command === "list-harnesses") {
      listHarnesses(io.stdout);
      return 0;
    }

    if (NOT_IMPLEMENTED_MODULES.has(options.command)) {
      return await dispatchFutureCommand(options, io);
    }

    io.stderr.write(`Unknown command: ${options.command}\n`);
    return 2;
  } catch (error) {
    io.stderr.write(`${error.message}\n`);
    return 2;
  }
}

async function dispatchFutureCommand(options, io) {
  const command = NOT_IMPLEMENTED_MODULES.get(options.command);
  try {
    const module = await import(command.path);
    const run = module[command.exportName];
    if (typeof run !== "function") {
      throw new Error(`${options.command} implementation is missing ${command.exportName}`);
    }
    return await run(options, io);
  } catch (error) {
    if (isMissingFutureModule(error, command.path)) {
      io.stderr.write(
        `${options.command} is not implemented yet; a later task will add ${command.path}.\n`,
      );
      return 2;
    }
    throw error;
  }
}

function isMissingFutureModule(error, modulePath) {
  if (error?.code !== "ERR_MODULE_NOT_FOUND") {
    return false;
  }
  const expectedUrl = new URL(modulePath, import.meta.url).href;
  return error.message.includes(expectedUrl) || error.message.includes(new URL(modulePath, import.meta.url).pathname);
}
