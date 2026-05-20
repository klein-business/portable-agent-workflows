import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { filesForHarnesses, resolveHarnesses } from "./harnesses.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const installManifestPath = ".agent-work/install.json";
const installableFiles = Object.freeze(filesForHarnesses(resolveHarnesses(undefined)));
const installableFileSet = new Set(installableFiles);

function readManifest(targetRoot) {
  const manifestPath = path.join(targetRoot, installManifestPath);
  let stat;
  try {
    stat = fs.lstatSync(manifestPath);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { manifest: null, failure: null };
    }
    throw error;
  }

  if (stat.isSymbolicLink()) {
    return { manifest: null, failure: `Refusing to read through symlink ${installManifestPath}` };
  }

  return { manifest: JSON.parse(fs.readFileSync(manifestPath, "utf8")), failure: null };
}

function readComparableFiles(root, relativePath) {
  const comparable = readComparablePath(root, relativePath);
  if (comparable.missing) {
    return { files: null, symlink: null };
  }

  return comparable;
}

function readComparablePath(root, relativePath) {
  const sourcePath = path.join(root, relativePath);
  let stat;
  try {
    stat = fs.lstatSync(sourcePath);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { files: null, symlink: null, missing: true };
    }
    throw error;
  }

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

function validateManifestFiles(manifest) {
  if (!manifest || manifest.files === undefined) {
    return { files: installableFiles, failures: [] };
  }

  if (!Array.isArray(manifest.files)) {
    return { files: [], failures: ["Invalid manifest files list"] };
  }

  const files = [];
  const failures = [];

  for (const entry of manifest.files) {
    const invalidReason = invalidManifestFileReason(entry);
    if (invalidReason !== null) {
      failures.push(invalidReason);
    } else if (!installableFileSet.has(entry)) {
      failures.push(`Unknown manifest file entry ${entry}`);
    } else {
      files.push(entry);
    }
  }

  return { files, failures };
}

function invalidManifestFileReason(entry) {
  if (typeof entry !== "string" || entry.length === 0) {
    return `Invalid manifest file entry ${String(entry)}`;
  }

  if (path.isAbsolute(entry) || entry.split(/[\\/]/).includes("..")) {
    return `Invalid manifest file entry ${entry}`;
  }

  return null;
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
  const { manifest, failure: manifestFailure } = readManifest(targetRoot);
  const manifestSelection = validateManifestFiles(manifest);
  const files = options.harness ? filesForHarnesses(resolveHarnesses(options.harness)) : manifestSelection.files;
  const failures = [];

  if (manifestFailure !== null) {
    failures.push(manifestFailure);
  }

  if (!options.harness) {
    failures.push(...manifestSelection.failures);
  }

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
