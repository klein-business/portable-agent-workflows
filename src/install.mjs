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

export function buildInstallActions(options) {
  const harnesses = resolveHarnesses(options.harness);
  const files = filesForHarnesses(harnesses);
  const targetRoot = path.resolve(options.target);
  const actions = files.map((relativePath) => ({
    type: fs.existsSync(path.join(targetRoot, relativePath)) ? "OVERWRITE" : "CREATE",
    relativePath,
    source: path.join(packageRoot, relativePath),
    target: path.join(targetRoot, relativePath),
  }));

  actions.push({
    type: fs.existsSync(path.join(targetRoot, ".agent-work/install.json")) ? "OVERWRITE" : "CREATE",
    relativePath: ".agent-work/install.json",
    source: null,
    target: path.join(targetRoot, ".agent-work/install.json"),
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

  return { harnesses, actions };
}

export async function runInit(options, io) {
  const { actions } = buildInstallActions(options);
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
    if (action.content !== undefined) {
      fs.mkdirSync(path.dirname(action.target), { recursive: true });
      fs.writeFileSync(action.target, action.content, "utf8");
    } else {
      copyRecursive(action.source, action.target);
    }
  }

  return 0;
}
