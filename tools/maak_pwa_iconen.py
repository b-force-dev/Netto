#!/usr/bin/env python3
"""Maak de PNG-iconen voor de installeerbare app uit favicon.svg.

Er is geen SVG-renderer nodig: favicon.svg is een afgeronde navy-tegel met één
gele N-vorm, en die vorm lezen we hier zelf uit het pad. Zo blijft favicon.svg
de enige bron; pas je hem aan, draai dit script opnieuw.

    python tools/maak_pwa_iconen.py

Schrijft:
  icons/icon-192.png            Android/Chrome, afgeronde tegel op transparant
  icons/icon-512.png            idem, groot (installatiedialoog, splash)
  icons/icon-maskable-512.png   volle vlak + N binnen de veilige zone (80%);
                                het besturingssysteem snijdt hier zelf een vorm uit
  apple-touch-icon.png          180x180, volle vlak (iOS rondt zelf af)
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SVG = ROOT / "favicon.svg"
SUPERSAMPLE = 4  # tekenen op 4x en terugschalen geeft gladde randen


def lees_svg(tekst: str) -> tuple[float, str, str, str, str]:
    """Geef (viewBox-breedte, tegelkleur, tegelstraal, vormkleur, pad) terug."""
    viewbox = re.search(r'viewBox="0 0 (\d+(?:\.\d+)?) \1"', tekst)
    rect = re.search(r'<rect[^>]*\brx="([\d.]+)"[^>]*\bfill="(#[0-9A-Fa-f]{6})"', tekst) \
        or re.search(r'<rect[^>]*\bfill="(#[0-9A-Fa-f]{6})"[^>]*\brx="([\d.]+)"', tekst)
    pad = re.search(r'<path[^>]*\bd="([^"]+)"[^>]*\bfill="(#[0-9A-Fa-f]{6})"', tekst)
    if not (viewbox and rect and pad):
        raise ValueError("favicon.svg heeft niet de verwachte opbouw (viewBox, rect, path)")
    # De volgorde van rx en fill hangt af van welke regex raakte.
    if rect.group(1).startswith("#"):
        achtergrond, straal = rect.group(1), rect.group(2)
    else:
        straal, achtergrond = rect.group(1), rect.group(2)
    return float(viewbox.group(1)), achtergrond, straal, pad.group(2), pad.group(1)


def pad_naar_punten(pad: str) -> list[tuple[float, float]]:
    """Lees een rechtlijnig SVG-pad (M, L, H, V, l, h, v, z) als puntenreeks."""
    tokens = re.findall(r"[A-Za-z]|-?\d*\.?\d+", pad)
    punten: list[tuple[float, float]] = []
    x = y = 0.0
    i = 0
    commando = ""
    while i < len(tokens):
        if tokens[i].isalpha():
            commando = tokens[i]
            i += 1
            if commando in "zZ":
                continue
        if commando in "Mm":
            nx, ny = float(tokens[i]), float(tokens[i + 1]); i += 2
            x, y = (nx, ny) if commando == "M" else (x + nx, y + ny)
            commando = "L" if commando == "M" else "l"
        elif commando in "Ll":
            nx, ny = float(tokens[i]), float(tokens[i + 1]); i += 2
            x, y = (nx, ny) if commando == "L" else (x + nx, y + ny)
        elif commando in "Hh":
            nx = float(tokens[i]); i += 1
            x = nx if commando == "H" else x + nx
        elif commando in "Vv":
            ny = float(tokens[i]); i += 1
            y = ny if commando == "V" else y + ny
        else:
            raise ValueError(f"Pad-commando '{commando}' wordt niet ondersteund")
        punten.append((x, y))
    return punten


def teken(grootte: int, *, afgerond: bool, vorm_schaal: float = 1.0) -> Image.Image:
    breedte, achtergrond, straal, kleur, pad = lees_svg(SVG.read_text(encoding="utf-8"))
    punten = pad_naar_punten(pad)
    groot = grootte * SUPERSAMPLE
    factor = groot / breedte
    midden = breedte / 2

    beeld = Image.new("RGBA", (groot, groot), (0, 0, 0, 0))
    tekening = ImageDraw.Draw(beeld)
    if afgerond:
        tekening.rounded_rectangle((0, 0, groot - 1, groot - 1), radius=float(straal) * factor, fill=achtergrond)
    else:
        tekening.rectangle((0, 0, groot, groot), fill=achtergrond)

    # Schaal de vorm rond het midden van het vlak.
    geschaald = [
        ((px - midden) * vorm_schaal + midden, (py - midden) * vorm_schaal + midden)
        for px, py in punten
    ]
    tekening.polygon([(px * factor, py * factor) for px, py in geschaald], fill=kleur)
    return beeld.resize((grootte, grootte), Image.LANCZOS)


def main() -> int:
    uitvoer = ROOT / "icons"
    uitvoer.mkdir(exist_ok=True)

    teken(192, afgerond=True).save(uitvoer / "icon-192.png", optimize=True)
    teken(512, afgerond=True).save(uitvoer / "icon-512.png", optimize=True)
    # Maskable: de N krijgt iets meer ruimte, maar blijft ruim binnen de cirkel
    # met 40% straal die Android altijd laat staan.
    teken(512, afgerond=False, vorm_schaal=1.2).save(uitvoer / "icon-maskable-512.png", optimize=True)
    # iOS wil een vierkant zonder transparantie; de afronding doet het systeem.
    teken(180, afgerond=False, vorm_schaal=1.1).convert("RGB").save(ROOT / "apple-touch-icon.png", optimize=True)

    for pad in (*sorted(uitvoer.glob("*.png")), ROOT / "apple-touch-icon.png"):
        with Image.open(pad) as plaatje:
            print(f"{pad.relative_to(ROOT)}: {plaatje.size[0]}x{plaatje.size[1]}, {pad.stat().st_size} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
