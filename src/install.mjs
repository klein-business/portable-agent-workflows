import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

import { ALL_HARNESSES, filesForHarnesses, resolveHarnesses } from "./harnesses.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageManifest = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"));
const packageVersion = packageManifest.version;

function copyRecursive(source, target) {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function removeInstallManifestFromActions(actions) {
  return actions.filter((action) => action.relativePath !== ".agent-work/install.json");
}

function isPathInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function findSymlinkInTargetPath(targetRoot, target) {
  const relative = path.relative(targetRoot, target);
  const parts = relative.split(path.sep).filter(Boolean);
  let current = targetRoot;

  for (const part of parts) {
    current = path.join(current, part);
    try {
      if (fs.lstatSync(current).isSymbolicLink()) {
        return path.relative(targetRoot, current);
      }
    } catch (error) {
      if (error?.code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }

  return null;
}

function unsafeWriteReason(action, targetRoot) {
  if (!isPathInside(targetRoot, action.target)) {
    return `Refusing to write outside target ${action.relativePath}`;
  }

  const symlinkPath = findSymlinkInTargetPath(targetRoot, action.target);
  if (symlinkPath !== null) {
    return `Refusing to write through symlink ${symlinkPath}`;
  }

  return null;
}

function symlinkTargetRootReason(targetRoot) {
  try {
    if (fs.lstatSync(targetRoot).isSymbolicLink()) {
      return "Refusing to use symlink target .";
    }
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }
    throw error;
  }

  return null;
}

async function resolveInitHarnessOption(options, io) {
  if (options.harness || options.yes) {
    return { harness: options.harness, error: null };
  }

  if (!io.stdin) {
    return { harness: null, error: "Pass --harness or --yes to install all supported harnesses." };
  }

  const ids = ALL_HARNESSES.map((harness) => harness.id).join(",");
  if (!io.stdin.isTTY) {
    io.stdout.write(`Select harnesses (${ids}; blank for all): `);
    const answer = await readPipedHarnessAnswer(io.stdin);
    if (answer === null) {
      return { harness: null, error: "Pass --harness or --yes to install all supported harnesses." };
    }
    return { harness: answer === "" ? undefined : answer, error: null };
  }

  const rl = createInterface({ input: io.stdin, output: io.stdout, terminal: false });
  try {
    const answer = await rl.question(`Select harnesses (${ids}; blank for all): `);
    return { harness: answer.trim() === "" ? undefined : answer.trim(), error: null };
  } finally {
    rl.close();
  }
}

async function readPipedHarnessAnswer(stdin) {
  let input = "";
  for await (const chunk of stdin) {
    input += chunk;
  }

  if (input.length === 0) {
    return null;
  }

  return input.split(/\r?\n/, 1)[0].trim();
}

export function buildInstallActions(options) {
  const harnesses = resolveHarnesses(options.harness);
  const files = filesForHarnesses(harnesses);
  const targetRoot = path.resolve(options.target);
  const actions = files.map((relativePath) => ({
    type: fs.existsSync(path.join(targetRoot, relativePath)) ? "OVERWRITE" : "CREATE",
    relativePath,
    source: path.join(packageRoot, relativePath),
    target: path.resolve(targetRoot, relativePath),
  }));

  actions.push({
    type: fs.existsSync(path.join(targetRoot, ".agent-work/install.json")) ? "OVERWRITE" : "CREATE",
    relativePath: ".agent-work/install.json",
    source: null,
    target: path.resolve(targetRoot, ".agent-work/install.json"),
    content:
      JSON.stringify(
        {
          package: "portable-agent-workflows",
          version: packageVersion,
          harnesses: harnesses.map((harness) => harness.id),
          files,
        },
        null,
        2,
      ) + "\n",
  });

  for (const action of actions) {
    if (!isPathInside(targetRoot, action.target)) {
      throw new Error(`Planned action escapes target: ${action.relativePath}`);
    }
  }

  return { harnesses, actions };
}

export async function runInit(options, io) {
  const harnessSelection = await resolveInitHarnessOption(options, io);
  if (harnessSelection.error !== null) {
    io.stderr.write(`${harnessSelection.error}\n`);
    return 1;
  }

  const { actions } = buildInstallActions({ ...options, harness: harnessSelection.harness });
  const targetRoot = path.resolve(options.target);
  const fileActions = removeInstallManifestFromActions(actions);

  for (const action of actions) {
    io.stdout.write(`${action.type} ${action.relativePath}\n`);
  }

  if (options.dryRun) {
    return 0;
  }

  for (const action of fileActions) {
    if (action.type === "OVERWRITE" && !options.force) {
      io.stderr.write(`Refusing to overwrite ${action.relativePath}; rerun with --force.\n`);
      return 1;
    }
  }

  const targetRootReason = symlinkTargetRootReason(targetRoot);
  if (targetRootReason !== null) {
    io.stderr.write(`${targetRootReason}; choose a real project directory.\n`);
    return 1;
  }

  for (const action of actions) {
    const reason = unsafeWriteReason(action, targetRoot);
    if (reason !== null) {
      io.stderr.write(`${reason}; remove the symlink or choose another target.\n`);
      return 1;
    }
  }

  for (const action of actions) {
    if (action.content !== undefined) {
      fs.mkdirSync(path.dirname(action.target), { recursive: true });
      fs.writeFileSync(action.target, action.content, "utf8");
    } else {
      copyRecursive(action.source, action.target);
    }
  }

  return 0;
}
