#!/usr/bin/env python3
"""
Import BibTeX entries into data/preprints.json or data/publications.json.

Usage:
  python3 scripts/import_bibtex.py bibtex/inbox.bib
  python3 scripts/import_bibtex.py bibtex/inbox.bib --target preprints
  python3 scripts/import_bibtex.py bibtex/inbox.bib --target publications
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DEFAULT_ME = "Min Soo Kim"


def strip_braces(value: str) -> str:
    value = value.strip().rstrip(",").strip()
    if len(value) >= 2 and value[0] == "{" and value[-1] == "}":
        value = value[1:-1]
    elif len(value) >= 2 and value[0] == '"' and value[-1] == '"':
        value = value[1:-1]
    return re.sub(r"\s+", " ", value).strip()


def parse_bibtex(text: str) -> list[dict]:
    entries = []
    i = 0
    while True:
        at = text.find("@", i)
        if at == -1:
            break

        kind_match = re.match(r"@([A-Za-z]+)\s*[{(]", text[at:])
        if not kind_match:
            i = at + 1
            continue

        kind = kind_match.group(1).lower()
        open_pos = at + kind_match.end() - 1
        close_char = "}" if text[open_pos] == "{" else ")"
        depth = 0
        quote = False
        end = open_pos

        while end < len(text):
            ch = text[end]
            prev = text[end - 1] if end > 0 else ""
            if ch == '"' and prev != "\\":
                quote = not quote
            elif not quote:
                if ch == text[open_pos]:
                    depth += 1
                elif ch == close_char:
                    depth -= 1
                    if depth == 0:
                        break
            end += 1

        body = text[open_pos + 1:end]
        comma = body.find(",")
        if comma == -1:
            i = end + 1
            continue

        key = body[:comma].strip()
        fields_text = body[comma + 1:]
        fields = parse_fields(fields_text)
        entries.append({"type": kind, "key": key, "fields": fields})
        i = end + 1

    return entries


def parse_fields(text: str) -> dict[str, str]:
    fields = {}
    pos = 0
    length = len(text)

    while pos < length:
        while pos < length and text[pos] in " \t\r\n,":
            pos += 1
        name_match = re.match(r"([A-Za-z][A-Za-z0-9_-]*)\s*=", text[pos:])
        if not name_match:
            break

        name = name_match.group(1)
        pos += name_match.end()
        while pos < length and text[pos].isspace():
            pos += 1

        value_start = pos
        if pos < length and text[pos] in '{"':
            opener = text[pos]
            closer = "}" if opener == "{" else '"'
            depth = 0
            quote = opener == '"'
            pos += 1
            if opener == "{":
                depth = 1
                while pos < length:
                    ch = text[pos]
                    if ch == "{":
                        depth += 1
                    elif ch == "}":
                        depth -= 1
                        if depth == 0:
                            pos += 1
                            break
                    pos += 1
            else:
                while pos < length:
                    ch = text[pos]
                    prev = text[pos - 1] if pos > 0 else ""
                    if ch == closer and prev != "\\":
                        pos += 1
                        quote = False
                        break
                    pos += 1
        else:
            while pos < length and text[pos] not in ",\n\r":
                pos += 1

        raw_value = text[value_start:pos]
        fields[name.lower()] = strip_braces(raw_value)

        while pos < length and text[pos] not in ",":
            pos += 1
        if pos < length and text[pos] == ",":
            pos += 1

    return fields


def split_authors(author_field: str) -> list[str]:
    if not author_field:
        return []
    return [normalize_author_name(author) for author in re.split(r"\s+and\s+", author_field) if author.strip()]


def normalize_author_name(author: str) -> str:
    author = strip_braces(author)
    if "," not in author:
        return author
    last, first = [part.strip() for part in author.split(",", 1)]
    return f"{first} {last}".strip()


def is_arxiv(fields: dict[str, str]) -> bool:
    archive = fields.get("archiveprefix", "").lower()
    venueish = " ".join(
        fields.get(key, "") for key in ("journal", "booktitle", "publisher", "note", "howpublished")
    ).lower()
    return archive == "arxiv" or "arxiv" in venueish or "arxiv.org" in fields.get("url", "")


def infer_target(entry: dict, forced: str) -> str:
    if forced != "auto":
        return forced
    return "preprints" if is_arxiv(entry["fields"]) else "publications"


def make_item(entry: dict, target: str) -> dict:
    fields = entry["fields"]
    title = fields.get("title", "Untitled")
    year = fields.get("year", "")
    try:
        year_value: int | str = int(year)
    except ValueError:
        year_value = year

    arxiv_id = fields.get("eprint", "")
    url = fields.get("url", "")
    if arxiv_id and not url:
        url = f"https://arxiv.org/abs/{arxiv_id}"

    if target == "preprints":
        venue = "arXiv" if is_arxiv(fields) else fields.get("note", "Preprint")
        tags = ["Under review"] if is_arxiv(fields) else []
        thumbnail = "assets/pub-4.svg"
    else:
        venue = fields.get("booktitle") or fields.get("journal") or fields.get("publisher") or fields.get("note") or "Venue"
        tags = []
        thumbnail = "assets/pub-1.svg"

    links = {}
    if url:
        links["paper"] = url
    if fields.get("doi"):
        links["doi"] = f"https://doi.org/{fields['doi']}"

    item = {
        "title": title,
        "authors": split_authors(fields.get("author", "")),
        "me": DEFAULT_ME,
        "venue": venue,
        "year": year_value,
        "venueColor": "ghost",
        "tags": tags,
        "thumbnail": thumbnail,
        "links": links,
        "abstract": fields.get("abstract", ""),
    }
    return item


def load_items(path: Path) -> list[dict]:
    return json.loads(path.read_text(encoding="utf-8"))


def save_items(path: Path, items: list[dict]) -> None:
    path.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def item_keys(item: dict) -> set[str]:
    keys = {str(item.get("title", "")).lower().strip()}
    links = item.get("links", {})
    for value in links.values():
        if value:
            keys.add(str(value).lower().strip())
    return keys


def entry_keys(entry: dict) -> set[str]:
    fields = entry["fields"]
    keys = {fields.get("title", "").lower().strip()}
    if fields.get("url"):
        keys.add(fields["url"].lower().strip())
    if fields.get("eprint"):
        keys.add(fields["eprint"].lower().strip())
        keys.add(f"https://arxiv.org/abs/{fields['eprint']}".lower())
    return {key for key in keys if key}


def add_entries(entries: list[dict], forced_target: str, dry_run: bool) -> dict[str, int]:
    counts = {"preprints": 0, "publications": 0, "skipped": 0}
    pending = {"preprints": [], "publications": []}
    existing_keys = {}

    for target in ("preprints", "publications"):
        items = load_items(DATA_DIR / f"{target}.json")
        pending[target] = items
        keys = set()
        for item in items:
            keys.update(item_keys(item))
        existing_keys[target] = keys

    for entry in entries:
        target = infer_target(entry, forced_target)
        keys = entry_keys(entry)
        if keys & existing_keys[target]:
            counts["skipped"] += 1
            continue

        item = make_item(entry, target)
        pending[target].append(item)
        existing_keys[target].update(item_keys(item))
        counts[target] += 1

    if not dry_run:
        for target, items in pending.items():
            save_items(DATA_DIR / f"{target}.json", items)

    return counts


def main() -> None:
    parser = argparse.ArgumentParser(description="Import BibTeX entries into homepage JSON files.")
    parser.add_argument("bibtex_file", type=Path)
    parser.add_argument("--target", choices=["auto", "preprints", "publications"], default="auto")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    text = args.bibtex_file.read_text(encoding="utf-8")
    entries = parse_bibtex(text)
    if not entries:
        raise SystemExit("No BibTeX entries found.")

    counts = add_entries(entries, args.target, args.dry_run)
    action = "Would add" if args.dry_run else "Added"
    print(
        f"{action} {counts['preprints']} preprint(s), "
        f"{counts['publications']} publication(s); skipped {counts['skipped']} duplicate(s)."
    )


if __name__ == "__main__":
    main()
