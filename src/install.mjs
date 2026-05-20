import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { filesForHarnesses, resolveHarnesses } from "./harnesses.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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
          version: "0.1.0",
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
  const { actions } = buildInstallActions(options);
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
