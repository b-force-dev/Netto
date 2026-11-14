#!/usr/bin/env python3
"""Verhoog de ?v=-versie van elk gewijzigd CSS-, JS- en databestand.

Draaien (vóór sync_website.py):  python tools/verhoog_versies.py

Een browser bewaart css/js lang. Zonder een hoger ?v=-nummer ziet een speler
na een update de oude bestanden. Dit script vergelijkt elk lokaal bestand waar
index.html, stats.html en admin.html naar verwijzen met de kopie in website/
(de laatst gepubliceerde stand). Is het bestand gewijzigd of nieuw, dan krijgt
het op alle pagina's hetzelfde, hogere nummer.
"""
from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEBSITE = ROOT / "website"
PAGES = ("index.html", "stats.html", "admin.html")
REF = re.compile(r'(?P<attr>src|href)="(?P<path>(?:css|js|data)/[^"?#]+\.(?:css|js))(?:\?v=(?P<v>\d+))?"')


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else ""


def main() -> int:
    texts = {page: (ROOT / page).read_text(encoding="utf-8") for page in PAGES}
    highest: dict[str, int] = {}
    for text in texts.values():
        for match in REF.finditer(text):
            highest[match["path"]] = max(highest.get(match["path"], 0), int(match["v"] or 0))

    target: dict[str, int] = {}
    for path, version in highest.items():
        changed = digest(ROOT / path) != digest(WEBSITE / path)
        target[path] = version + 1 if changed or version == 0 else version

    bumped = sorted(p for p in target if target[p] != highest[p])
    for page, text in texts.items():
        new = REF.sub(lambda m: f'{m["attr"]}="{m["path"]}?v={target[m["path"]]}"', text)
        if new != text:
            (ROOT / page).write_text(new, encoding="utf-8", newline="")
    print("Verhoogd: " + ", ".join(bumped) if bumped else "Geen versies gewijzigd.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
