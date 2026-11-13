#!/usr/bin/env python3
"""Synchronize the canonical root frontend into the standalone website mirror."""

from __future__ import annotations

import argparse
import hashlib
import re
import shutil
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WEBSITE = ROOT / "website"
ASSET_REF = re.compile(r'(?:src|href)="((?:css|js|data)/[^"?#]+\.(?:css|js))')

# Only browser/runtime files belong in the mirror. Source work happens in ROOT.
MIRROR_FILES = (
    "index.html",
    "404.html",
    "admin.html",
    "stats.html",
    "favicon.svg",
    "og-image.png",
    # Installeerbare app: manifest, service worker (moet in de root staan om de
    # hele site te beslaan), offline-pagina en het icoon voor iOS.
    "manifest.webmanifest",
    "sw.js",
    "offline.html",
    "apple-touch-icon.png",
    "css/styles.css",
    "css/refinement.css",
    "css/answer-reveal.css",
    "css/live-rounds.css",
    "css/admin.css",
    "css/stats-page.css",
    "css/puzzle-library.css",
    "css/vindbaarheid.css",
    "css/pwa.css",
    "js/core.js",
    "js/answer-reveal.js",
    "js/question-context.js",
    "js/puzzle-modes.js",
    "js/find-connection.js",
    "js/race.js",
    "js/live-rounds.js",
    "js/submissions.js",
    "js/library.js",
    "js/app.js",
    "js/site-navigation.js",
    "js/routes.js",
    "js/stats-page.js",
    "js/i18n.js",
    "js/daily-photos.js",
    "js/photo-credits.js",
    "js/pwa.js",
    "data/netto_translations_en.js",
    "data/netto_bronnen.js",
    "data/netto_bronnen_en.js",
    "data/netto_frontend_puzzles.js",
    "data/netto_race_pool.js",
)

# Mappen waarvan de volledige inhoud mee moet. De daily gebruikt alle foto's uit
# fotos/assets, dus een handmatige bestandslijst raakt hier gegarandeerd achter.
MIRROR_DIRS = (
    "fotos/assets",
    "icons",  # PNG-iconen van de app, gemaakt door tools/maak_pwa_iconen.py
)


def referenced_assets() -> list[str]:
    """Lokale css/js/data-bestanden waar de pagina's naar verwijzen.

    Zo komt een nieuw bestand vanzelf mee; een vergeten regel in MIRROR_FILES
    gaf anders een 404 op de live site.
    """
    found: list[str] = []
    for page in ("index.html", "stats.html", "admin.html"):
        text = (ROOT / page).read_text(encoding="utf-8")
        for match in ASSET_REF.finditer(text):
            if match.group(1) not in found:
                found.append(match.group(1))
    return found


def mirrored_files() -> tuple[str, ...]:
    files = list(MIRROR_FILES)
    files += [path for path in referenced_assets() if path not in files]
    for relative_dir in MIRROR_DIRS:
        source_dir = ROOT / relative_dir
        if not source_dir.is_dir():
            raise FileNotFoundError(f"Canonical directory is missing: {source_dir}")
        for path in sorted(source_dir.iterdir()):
            if path.is_file():
                files.append(f"{relative_dir}/{path.name}")
    return tuple(files)


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def differing_files() -> list[str]:
    different: list[str] = []
    for relative in mirrored_files():
        source = ROOT / relative
        target = WEBSITE / relative
        if not source.is_file():
            raise FileNotFoundError(f"Canonical file is missing: {source}")
        if not target.is_file() or digest(source) != digest(target):
            different.append(relative)
    return different


def sync() -> list[str]:
    changed = differing_files()
    for relative in changed:
        source = ROOT / relative
        target = WEBSITE / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
    return changed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="report drift without changing files",
    )
    args = parser.parse_args()

    changed = differing_files() if args.check else sync()
    if changed:
        action = "Out of sync" if args.check else "Synchronized"
        print(f"{action}: {', '.join(changed)}")
        return 1 if args.check else 0

    print("website/ is identical to the canonical frontend.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
