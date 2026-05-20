from __future__ import annotations

import argparse
import re
import sys
import urllib.parse
from pathlib import Path

IGNORED_PARTS = {".git", ".venv"}
SCHEME_RE = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.-]*:")


def markdown_files(root: Path) -> list[Path]:
    return sorted(
        path
        for path in root.rglob("*.md")
        if not IGNORED_PARTS.intersection(path.relative_to(root).parts)
    )


def markdown_link_targets(text: str) -> list[str]:
    targets = []
    search_start = 0

    while True:
        label_start = text.find("[", search_start)
        if label_start == -1:
            return targets

        target_start = text.find("](", label_start + 1)
        if target_start == -1:
            return targets

        raw_target, target_end = parse_markdown_link_target(text, target_start + 2)
        if raw_target is not None:
            targets.append(raw_target)
            search_start = target_end + 1
        else:
            search_start = target_start + 2


def parse_markdown_link_target(text: str, start: int) -> tuple[str | None, int]:
    if start >= len(text):
        return None, start

    if text[start] == "<":
        target_end = text.find(">", start + 1)
        if target_end == -1:
            return None, start

        close_paren = text.find(")", target_end + 1)
        if close_paren == -1:
            return None, start

        return text[start:close_paren], close_paren

    depth = 1
    escaped = False
    index = start

    while index < len(text):
        character = text[index]
        if escaped:
            escaped = False
        elif character == "\\":
            escaped = True
        elif character == "(":
            depth += 1
        elif character == ")":
            depth -= 1
            if depth == 0:
                return text[start:index], index

        index += 1

    return None, start


def local_link_target(raw_target: str) -> str | None:
    target = raw_target.strip()
    if target.startswith("<"):
        target_end = target.find(">")
        if target_end == -1:
            return None
        target = target[1:target_end]
    else:
        target = strip_markdown_title(target)

    if not target or target.startswith("#") or SCHEME_RE.match(target):
        return None

    target = target.split("#", 1)[0]
    if not target:
        return None

    return urllib.parse.unquote(target)


def strip_markdown_title(target: str) -> str:
    for delimiter in ('"', "'"):
        title_start = target.find(f" {delimiter}")
        if title_start != -1:
            return target[:title_start]

    return target


def resolve_local_target(root: Path, source: Path, target: str) -> Path:
    if target.startswith("/"):
        return (root / target.lstrip("/")).resolve()

    return (source.parent / target).resolve()


def find_missing_links(root: Path) -> list[str]:
    missing = []
    root = root.resolve()

    for path in markdown_files(root):
        text = path.read_text(encoding="utf-8")
        for raw_target in markdown_link_targets(text):
            target = local_link_target(raw_target)
            if target is None:
                continue

            resolved = resolve_local_target(root, path, target)
            if not resolved.exists() or not resolved.is_relative_to(root):
                missing.append(f"{path.relative_to(root)} -> {raw_target}")

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
    if not root.is_dir():
        print(f"Error: --root does not exist or is not a directory: {root}", file=sys.stderr)
        return 2

    missing = find_missing_links(root)
    if missing:
        print("Missing Markdown links:")
        print("\n".join(missing))
        return 1

    print(f"Checked {len(markdown_files(root))} Markdown files; local links resolve.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
