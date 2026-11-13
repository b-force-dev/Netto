#!/usr/bin/env python3
"""Maak de vaste GitHub Pages-ingangen voor Netto zonder kopieën in Git te bewaren.

Per route komt er een eigen index.html met eigen titel, beschrijving en
canonical-adres (zie seo.py). Daarnaast schrijft dit script robots.txt,
sitemap.xml en 404.html in de gepubliceerde map.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import seo  # noqa: E402  (zoekmachinegegevens en het enige site-adres)


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data/netto_frontend_puzzles.js"
SCREENS = (
    "daily", "daily-archive", "puzzles", "connections", "race", "live-rounds",
    "race/online", "leaderboard", "settings", "how-to-play",
    "submit-question", "about", "photo-credits", "openaec",
)


def puzzles() -> dict:
    raw = DATA.read_text(encoding="utf-8").strip()
    return json.loads(raw.split("window.NETTO_REBUILT_PUZZLES =", 1)[1].strip().rstrip(";"))


def connection(puzzle: dict) -> bool:
    answers = [puzzle.get(f"q{i}_answer") for i in (1, 2, 3)]
    if any(not isinstance(a, int) or a <= 0 for a in answers) or len(set(answers)) != 3:
        return False
    if not all(puzzle.get(f"q{i}_label") for i in (1, 2, 3)):
        return False
    families = set()
    for a in answers:
        for b in answers:
            if a == b:
                continue
            for c in answers:
                if c in (a, b):
                    continue
                if a + b == c or a - b == c:
                    families.add("sum")
                if a * b == c or a == b * c:
                    families.add("product")
    return len(families) == 1


def routes(data: dict) -> dict[str, str]:
    items = {name: "index.html" for name in SCREENS}
    items["stats"] = "stats.html"
    items["admin"] = "admin.html"
    for puzzle in data["library"]:
        number = int(puzzle["number"])
        items[f"puzzles/{number}"] = "index.html"
    for puzzle in data.get('connection', data['library']):
        number = int(puzzle['number'])
        if connection(puzzle):
            items[f"connections/{number}"] = "index.html"
    # Ook nog niet gepubliceerde dagpuzzels kunnen uit de database komen.
    first = min((date.fromisoformat(puzzle["date"]) for puzzle in data["daily"]), default=date(2026, 9, 21))
    last = date.today() + timedelta(days=366)
    day = first
    while day <= last:
        items[f"daily/{day.strftime('%y-%m-%d')}"] = "index.html"
        day += timedelta(days=1)
    return items


def make_entry(source: str, route: str, filename: str = "index.html") -> str:
    depth = route.count("/") + 1
    base = "../" * depth
    if "<head>" not in source:
        raise ValueError("De HTML-pagina heeft geen head-element")
    if filename == "index.html":
        source = seo.apply_seo(source, route)
    eol = "\r\n" if "\r\n" in source else "\n"
    return source.replace("<head>", f'<head>{eol}<base href="{base}">', 1)


def read(path: Path) -> str:
    # Bytes, zodat de regeleindes van het bronbestand ongewijzigd blijven.
    return path.read_bytes().decode("utf-8")


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode("utf-8"))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site", type=Path, default=ROOT / "website")
    args = parser.parse_args()
    site = args.site.resolve()
    if not (site / "index.html").is_file():
        parser.error(f"Geen Netto-site gevonden in {site}")
    data = puzzles()
    entries = routes(data)
    originals = {name: read(site / name) for name in set(entries.values())}
    for route, filename in entries.items():
        write(site / route / "index.html", make_entry(originals[filename], route, filename))
    # De startpagina krijgt dezelfde gegenereerde kop als de andere routes.
    write(site / "index.html", seo.apply_seo(originals["index.html"], ""))
    missing = [route for route in seo.SITEMAP_ROUTES if route and route not in entries]
    if missing:
        raise SystemExit(f"Sitemap noemt routes die niet bestaan: {', '.join(missing)}")
    write(site / "sitemap.xml", seo.sitemap())
    write(site / "robots.txt", seo.robots())
    if (site / "404.html").is_file():
        write(site / "404.html", seo.not_found_page(read(site / "404.html")))
    print(f"{len(entries)} routepagina's, sitemap.xml en robots.txt gemaakt in {site}")


if __name__ == "__main__":
    main()
