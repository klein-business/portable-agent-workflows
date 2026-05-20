import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { filesForHarnesses, resolveHarnesses } from "./harnesses.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const installManifestPath = ".agent-work/install.json";

function readManifest(targetRoot) {
  const manifestPath = path.join(targetRoot, installManifestPath);
  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function readComparableFiles(root, relativePath) {
  const sourcePath = path.join(root, relativePath);
  if (!fs.existsSync(sourcePath)) {
    return { files: null, symlink: null };
  }

  return readComparablePath(root, relativePath);
}

function readComparablePath(root, relativePath) {
  const sourcePath = path.join(root, relativePath);
  const stat = fs.lstatSync(sourcePath);
  if (stat.isSymbolicLink()) {
    return { files: null, symlink: relativePath };
  }

  if (!stat.isDirectory()) {
    return { files: new Map([[relativePath, fs.readFileSync(sourcePath, "utf8")]]), symlink: null };
  }

  const files = new Map();
  const symlink = readDirectoryFiles(root, relativePath, files);
  return { files, symlink };
}

function readDirectoryFiles(root, relativePath, files) {
  const directoryPath = path.join(root, relativePath);
  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const nestedRelative = path.join(relativePath, entry.name);
    if (nestedRelative === installManifestPath) {
      continue;
    }

    const nestedPath = path.join(directoryPath, entry.name);
    if (entry.isSymbolicLink()) {
      return nestedRelative;
    }

    if (entry.isDirectory()) {
      const symlink = readDirectoryFiles(root, nestedRelative, files);
      if (symlink !== null) {
        return symlink;
      }
    } else if (entry.isFile()) {
      files.set(nestedRelative, fs.readFileSync(nestedPath, "utf8"));
    }
  }

  return null;
}

export async function runCheck(options, io) {
  const targetRoot = path.resolve(options.target);
  const manifest = readManifest(targetRoot);
  const files = options.harness
    ? filesForHarnesses(resolveHarnesses(options.harness))
    : (manifest?.files ?? filesForHarnesses(resolveHarnesses(undefined)));
  const failures = [];

  for (const relativePath of files) {
    const expected = readComparableFiles(packageRoot, relativePath);
    const actual = readComparableFiles(targetRoot, relativePath);

    if (actual.symlink !== null) {
      failures.push(`Refusing to read through symlink ${actual.symlink}`);
      continue;
    }

    if (actual.files === null) {
      failures.push(`Missing ${relativePath}`);
      continue;
    }

    if (expected.symlink !== null || expected.files === null) {
      throw new Error(`Package file is not readable: ${relativePath}`);
    }

    for (const [nestedRelative, expectedContent] of expected.files.entries()) {
      if (!actual.files.has(nestedRelative)) {
        failures.push(`Missing ${nestedRelative}`);
      } else if (actual.files.get(nestedRelative) !== expectedContent) {
        failures.push(`Drifted ${nestedRelative}`);
      }
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      io.stderr.write(`${failure}\n`);
    }
    return 1;
  }

  io.stdout.write("Installed portable-agent-workflows files are current.\n");
  return 0;
}
