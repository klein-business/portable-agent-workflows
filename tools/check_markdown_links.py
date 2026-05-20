from __future__ import annotations

import argparse
import re
import sys
import urllib.parse
from pathlib import Path

IGNORED_PARTS = {".git", ".venv"}
LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
SCHEME_RE = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.-]*:")


def markdown_files(root: Path) -> list[Path]:
    return sorted(
        path
        for path in root.rglob("*.md")
        if not IGNORED_PARTS.intersection(path.relative_to(root).parts)
    )


def local_link_target(raw_target: str) -> str | None:
    target = raw_target.strip()
    if target.startswith("<") and target.endswith(">"):
        target = target[1:-1]
    target = target.split()[0]

    if not target or target.startswith("#") or SCHEME_RE.match(target):
        return None

    target = target.split("#", 1)[0]
    if not target:
        return None

    return urllib.parse.unquote(target)


def find_missing_links(root: Path) -> list[str]:
    missing = []

    for path in markdown_files(root):
        text = path.read_text(encoding="utf-8")
        for match in LINK_RE.finditer(text):
            target = local_link_target(match.group(1))
            if target is None:
                continue

            resolved = (path.parent / target).resolve()
            if not resolved.exists():
                missing.append(f"{path.relative_to(root)} -> {match.group(1)}")

    return missing


def main() -> int:
    parser = argparse.ArgumentParser(description="Check local Markdown links.")
    parser.add_argument(
        "--root",
        type=Path,
        default=Path.cwd(),
        help="Repository root to scan. Defaults to the current working directory.",
    )
    args = parser.parse_args()

    root = args.root.resolve()
    missing = find_missing_links(root)
    if missing:
        print("Missing Markdown links:")
        print("\n".join(missing))
        return 1

    print(f"Checked {len(markdown_files(root))} Markdown files; local links resolve.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
