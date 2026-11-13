#!/usr/bin/env python3
"""Zoekmachine- en deelgegevens van Netto: titels, beschrijvingen, JSON-LD, sitemap en robots.txt.

Dit bestand is de enige plek waar de teksten voor Google en deelvoorbeelden
staan. `bouw_routes.py` gebruikt het bij het publiceren; met `--bron-bijwerken`
schrijft het ook de kop van index.html in de project-root, zodat de startpagina
ook lokaal al goed is.

Volledig adres wijzigen (bijvoorbeeld bij een eigen domein): pas alleen SITE_URL
hieronder aan, draai `python tools/seo.py --bron-bijwerken` en
`python tools/sync_website.py`. Zie docs/vindbaarheid.md voor de overige stappen.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# ---------------------------------------------------------------------------
# Het enige adres van de site. Altijd met een slash aan het eind.
SITE_URL = "https://b-force-dev.github.io/nettoo/"
# ---------------------------------------------------------------------------

SITE_NAME = "Netto"
SOCIAL_IMAGE = "og-image.png"          # 1200 x 630
SOCIAL_IMAGE_ALT_EN = "Netto: three questions, one connection, a new puzzle every day."
SOCIAL_IMAGE_ALT_NL = "Netto: drie vragen, één verband, elke dag een nieuwe puzzel."

HEAD_BEGIN = "<!-- seo:begin (gegenereerd door tools/seo.py, niet met de hand wijzigen) -->"
HEAD_END = "<!-- seo:end -->"
NOSCRIPT_BEGIN = "<!-- seo:noscript-begin -->"
NOSCRIPT_END = "<!-- seo:noscript-end -->"
HEAD_RE = re.compile(re.escape("<!-- seo:begin") + r".*?" + re.escape(HEAD_END), re.S)
NOSCRIPT_RE = re.compile(re.escape(NOSCRIPT_BEGIN) + r".*?" + re.escape(NOSCRIPT_END), re.S)

# Routes die in de sitemap komen: de blijvende pagina's, geen losse puzzels of datums.
# Volgorde = volgorde in de sitemap. Elke route staat ook in PAGES hieronder.
SITEMAP_ROUTES = (
    "", "daily", "how-to-play", "puzzles", "connections", "race", "live-rounds",
    "daily-archive", "leaderboard", "submit-question", "about",
)

# Zoekwoorden staan in gewone zinnen, niet als lijstje: ze zijn bedoeld voor mensen.
PAGES: dict[str, dict] = {
    "": {
        "title": ("Netto – a daily estimation game and trivia puzzle",
                  "Netto – dagelijks schatspel en quizpuzzel"),
        "description": (
            "Netto is a free daily estimation game. Guess three facts, spot the connection between them and see how close you get. A new trivia puzzle every day.",
            "Netto is een gratis dagelijks schatspel. Schat drie feiten, ontdek het verband ertussen en kijk hoe dichtbij je komt. Elke dag een nieuwe quizpuzzel.",
        ),
        "h1": "Netto: a daily estimation game",
        "body": [
            "Every day Netto gives you three trivia questions that each have a number as their answer. The answers are linked by a simple calculation, such as 4 × 2 = 8. Estimate all three, use the connection as a clue and try to stay close to the real answers.",
            "Play the Daily, replay the archive, race the clock in the Puzzle Race or challenge friends in Live Rounds.",
        ],
    },
    "daily": {
        "title": ("Today's Daily – estimate three facts | Netto",
                  "De Daily van vandaag – schat drie feiten | Netto"),
        "description": (
            "Play today's Netto Daily: estimate three facts, use the hidden connection between them and share your score. One new puzzle every day.",
            "Speel de Netto Daily van vandaag: schat drie feiten, gebruik het verband ertussen en deel je score. Elke dag één nieuwe puzzel.",
        ),
        "h1": "Today's Daily",
        "body": ["One new estimation puzzle every day: three questions, one connection. A new Daily appears at midnight London time."],
    },
    "how-to-play": {
        "title": ("How to play Netto – rules of the daily estimation game",
                  "Zo speel je Netto – de regels van het dagelijkse schatspel"),
        "description": (
            "Learn how Netto works: estimate three answers, use the equation between them as a clue and keep your score factor low. Rules and scoring explained.",
            "Zo werkt Netto: schat drie antwoorden, gebruik de formule ertussen als aanwijzing en houd je factor laag. Spelregels en puntentelling uitgelegd.",
        ),
        "h1": "How to play Netto",
        "body": [
            "Estimate three answers. Use the equation as an extra clue. The lowest factor wins.",
            "1. Estimate all three answers. Enter your best estimate for each question. You do not need to know the exact answer.",
            "2. Check the connection. The first two answers combine to make the third, for example 4 × 2 = 8. Use an answer you trust to check the other two.",
            "3. Keep your factor low. An exact answer scores 1.00×. If you are twice too high or too low, you score 2.00×. Your final score is the average of all three.",
        ],
        "faq": [
            ("How do you play Netto?",
             "Every puzzle has three questions. Enter your best estimate for each one; you do not need to know the exact answer."),
            ("What is the connection between the three answers?",
             "The first two answers combine to make the third, for example 4 × 2 = 8. Use an answer you trust to check the other two."),
            ("How is the score calculated?",
             "Your score is a factor. An exact answer scores 1.00×. If you are twice too high or too low, you score 2.00×. Your final score is the average of the three, and the lowest factor wins."),
        ],
    },
    "puzzles": {
        "title": ("Estimation puzzles in four difficulty levels | Netto",
                  "Schatpuzzels in vier niveaus | Netto"),
        "description": (
            "Browse Netto's library of estimation puzzles in four difficulty levels, from easy to extremely hard. Every question appears exactly once.",
            "Blader door de puzzelbibliotheek van Netto in vier niveaus, van makkelijk tot extreem moeilijk. Elke vraag komt precies één keer voor.",
        ),
        "h1": "Estimation puzzles",
        "body": ["Pick a puzzle in one of four difficulty levels: easy, intermediate, hard and extremely hard."],
    },
    "connections": {
        "title": ("Find the Connection – number chain puzzles | Netto",
                  "Find the Connection – verbandpuzzels | Netto"),
        "description": (
            "Netto's Find the Connection puzzles: put three questions in the right order so that their answers connect through a sum or a product.",
            "De Find the Connection-puzzels van Netto: zet drie vragen in de juiste volgorde, zodat de antwoorden samenhangen via een som of een product.",
        ),
        "h1": "Find the Connection",
        "body": ["Rearrange three questions until their answers connect through a sum or a product."],
    },
    "race": {
        "title": ("Puzzle Race – solve estimation puzzles against the clock | Netto",
                  "Puzzelrace – los schatpuzzels op tegen de klok | Netto"),
        "description": (
            "Race the clock in Netto's Puzzle Race: solve as many estimation puzzles as you can in five minutes, on your own or in a 1v1 duel.",
            "Race tegen de klok in de Puzzelrace van Netto: los in vijf minuten zoveel mogelijk schatpuzzels op, alleen of in een duel tegen een tegenstander.",
        ),
        "h1": "Puzzle Race",
        "body": ["Race the clock. Solve as many puzzles as you can in five minutes, on your own or against an opponent."],
    },
    "live-rounds": {
        "title": ("Live Rounds – multiplayer estimation game | Netto",
                  "Live Rondes – schatspel voor meerdere spelers | Netto"),
        "description": (
            "Play Netto Live Rounds with friends: the same puzzle, the same clock, and whoever estimates closest wins. For 2 to 8 players.",
            "Speel Live Rondes in Netto met vrienden: dezelfde puzzel, dezelfde klok, en wie het dichtst zit wint. Voor 2 tot 8 spelers.",
        ),
        "h1": "Live Rounds",
        "body": ["The same puzzle, the same clock. Who estimates closest? For 2 to 8 players."],
    },
    "daily-archive": {
        "title": ("Daily Archive – replay past Netto puzzles",
                  "Daily-archief – speel eerdere Netto-puzzels opnieuw"),
        "description": (
            "Missed a day? Replay every past Netto Daily puzzle from the archive and try to beat your earlier score.",
            "Een dag gemist? Speel elke eerdere Netto Daily opnieuw vanuit het archief en probeer je eerdere score te verbeteren.",
        ),
        "h1": "Daily Archive",
        "body": ["Replay every past Daily puzzle."],
    },
    "leaderboard": {
        "title": ("Leaderboard – see how you rank | Netto",
                  "Ranglijst – zie hoe jij scoort | Netto"),
        "description": (
            "See how you rank against other Netto players on the leaderboard.",
            "Bekijk op de ranglijst hoe jij het doet ten opzichte van andere Netto-spelers.",
        ),
        "h1": "Leaderboard",
        "body": ["See how you rank against other Netto players."],
    },
    "submit-question": {
        "title": ("Submit a trivia question | Netto",
                  "Stuur een quizvraag in | Netto"),
        "description": (
            "Know a surprising fact with a number as its answer? Submit your own question to Netto; the best ones become part of the game.",
            "Ken je een verrassend feit met een getal als antwoord? Stuur je eigen vraag in bij Netto; de beste komen terug in het spel.",
        ),
        "h1": "Submit a question",
        "body": ["Know a surprising fact with a number as its answer? Submit your own question; the best ones make it into the game."],
    },
    "about": {
        "title": ("About Netto – a game about estimating well",
                  "Over Netto – een spel over goed schatten"),
        "description": (
            "Netto is a game about estimating well, made by B-Force. You do not need to know every fact: logic, a feel for proportions and a good guess are enough.",
            "Netto is een spel over goed schatten, gemaakt door B-Force. Je hoeft niet ieder feit te kennen: logica, gevoel voor verhoudingen en een goede gok zijn genoeg.",
        ),
        "h1": "A game about estimating well",
        "body": [
            "You do not need to know every fact. Netto rewards logic, a feel for proportions and a well-judged guess.",
            "B-Force writes and checks the questions. Found something that could be sharper? Submit your own question; the best ones make it into the game.",
        ],
    },
}

# Pagina's die bestaan maar geen zoekresultaat horen te zijn.
# Zelfde vorm als PAGES; ontbrekende velden vallen terug op de startpagina.
UTILITY_PAGES: dict[str, dict] = {
    "settings": {"title": ("Settings | Netto", "Instellingen | Netto"), "h1": "Settings"},
    "stats": {"title": ("Statistics | Netto", "Statistieken | Netto"), "h1": "Statistics"},
    "admin": {"title": ("Admin | Netto", "Beheer | Netto"), "h1": "Admin"},
    "race/online": {"title": ("Online Puzzle Race | Netto", "Online puzzelrace | Netto"), "h1": "Online Puzzle Race"},
    "photo-credits": {"title": ("Photo credits | Netto", "Fotoverantwoording | Netto"), "h1": "Photo credits"},
    "openaec": {"title": ("Open AEC puzzle | Netto", "Open AEC-puzzel | Netto"), "h1": "Open AEC puzzle"},
}


def page_url(route: str) -> str:
    """Volledig adres van een route; de startpagina is SITE_URL zelf."""
    return f"{SITE_URL}{route}/" if route else SITE_URL


def meta_for(route: str) -> dict:
    """Alle gegevens van één route: tekst, of hij geïndexeerd mag worden en welke JSON-LD erbij hoort."""
    home = PAGES[""]
    if route in PAGES:
        page = dict(PAGES[route])
        page["index"] = True
        return page
    if route in UTILITY_PAGES:
        page = {**home, **UTILITY_PAGES[route]}
        page["body"] = []
        page["index"] = False
        return page
    # Losse puzzels en datums: bruikbaar om te delen, maar dunne herhaling voor een zoekmachine.
    kind, _, key = route.partition("/")
    parent = {"daily": "daily", "puzzles": "puzzles", "connections": "connections"}.get(kind)
    if not parent:
        raise KeyError(f"Geen zoekgegevens voor route '{route}'")
    labels = {
        "daily": (f"Netto Daily {key}", f"Netto Daily {key}"),
        "puzzles": (f"Puzzle {key} | Netto", f"Puzzel {key} | Netto"),
        "connections": (f"Find the Connection {key} | Netto", f"Find the Connection {key} | Netto"),
    }[kind]
    page = dict(PAGES[parent])
    page["title"] = labels
    page["h1"] = labels[0].replace(" | Netto", "")
    page["body"] = PAGES[parent]["body"][:1]
    page.pop("faq", None)
    page["index"] = False
    return page


def _attr(value: str) -> str:
    return escape(value, quote=True)


def _data_nl(nl: str, en: str) -> str:
    return f' data-nl="{_attr(nl)}"' if nl != en else ""


def json_ld(route: str, page: dict) -> list[dict]:
    """Gestructureerde gegevens: WebSite en VideoGame op de startpagina, FAQ bij de spelregels."""
    graph: list[dict] = []
    image = SITE_URL + SOCIAL_IMAGE
    if route == "":
        graph.append({
            "@type": "WebSite",
            "@id": SITE_URL + "#website",
            "url": SITE_URL,
            "name": SITE_NAME,
            "description": page["description"][0],
            "inLanguage": ["en", "nl"],
        })
        graph.append({
            "@type": "VideoGame",
            "@id": SITE_URL + "#game",
            "url": SITE_URL,
            "name": SITE_NAME,
            "description": page["description"][0],
            "image": image,
            "genre": ["Puzzle", "Trivia", "Estimation"],
            "applicationCategory": "GameApplication",
            "gamePlatform": "Web browser",
            "operatingSystem": "Any",
            "playMode": ["SinglePlayer", "MultiPlayer"],
            "inLanguage": ["en", "nl"],
            "isAccessibleForFree": True,
            "offers": {"@type": "Offer", "price": "0", "priceCurrency": "EUR"},
            "publisher": {"@type": "Organization", "name": "B-Force"},
            "isPartOf": {"@id": SITE_URL + "#website"},
        })
    elif page["index"]:
        graph.append({
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": SITE_NAME, "item": SITE_URL},
                {"@type": "ListItem", "position": 2, "name": page["h1"], "item": page_url(route)},
            ],
        })
    if page.get("faq"):
        graph.append({
            "@type": "FAQPage",
            "mainEntity": [
                {"@type": "Question", "name": question,
                 "acceptedAnswer": {"@type": "Answer", "text": answer}}
                for question, answer in page["faq"]
            ],
        })
    return graph


def head_block(route: str) -> str:
    page = meta_for(route)
    (title_en, title_nl), (desc_en, desc_nl) = page["title"], page.get("description", PAGES[""]["description"])
    url = page_url(route)
    image = SITE_URL + SOCIAL_IMAGE
    lines = [
        HEAD_BEGIN,
        f'<title{_data_nl(title_nl, title_en)}>{escape(title_en)}</title>',
        f'<meta name="description" content="{_attr(desc_en)}"{_data_nl(desc_nl, desc_en)}>',
    ]
    if page["index"]:
        lines.append(f'<link rel="canonical" href="{_attr(url)}">')
    else:
        lines.append('<meta name="robots" content="noindex, follow">')
    lines += [
        '<meta property="og:type" content="website">',
        f'<meta property="og:site_name" content="{SITE_NAME}">',
        '<meta property="og:locale" content="en_US">',
        '<meta property="og:locale:alternate" content="nl_NL">',
        f'<meta property="og:title" content="{_attr(title_en)}"{_data_nl(title_nl, title_en)}>',
        f'<meta property="og:description" content="{_attr(desc_en)}"{_data_nl(desc_nl, desc_en)}>',
        f'<meta property="og:url" content="{_attr(url)}">',
        f'<meta property="og:image" content="{_attr(image)}">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        f'<meta property="og:image:alt" content="{_attr(SOCIAL_IMAGE_ALT_EN)}"{_data_nl(SOCIAL_IMAGE_ALT_NL, SOCIAL_IMAGE_ALT_EN)}>',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{_attr(title_en)}"{_data_nl(title_nl, title_en)}>',
        f'<meta name="twitter:description" content="{_attr(desc_en)}"{_data_nl(desc_nl, desc_en)}>',
        f'<meta name="twitter:image" content="{_attr(image)}">',
    ]
    graph = json_ld(route, page)
    if graph:
        payload = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=2)
        payload = payload.replace("<", "\\u003c")
        lines.append(f'<script type="application/ld+json">\n{payload}\n</script>')
    lines.append(HEAD_END)
    return "\n".join(lines)


NAV_LINKS = (
    ("daily", "Today's Daily"), ("how-to-play", "How to play"), ("puzzles", "Puzzles"),
    ("connections", "Find the Connection"), ("race", "Puzzle Race"), ("live-rounds", "Live Rounds"),
    ("about", "About Netto"),
)


def noscript_block(route: str) -> str:
    """Tekst voor wie (of wat) geen JavaScript draait: een kale pagina met uitleg en echte links."""
    page = meta_for(route)
    paragraphs = "".join(f"<p>{escape(text)}</p>" for text in page["body"])
    links = " · ".join(f'<a href="{path}/" style="color:#ffd84a">{escape(label)}</a>' for path, label in NAV_LINKS)
    return (
        f"{NOSCRIPT_BEGIN}\n"
        '<noscript><div style="position:relative;z-index:5;max-width:40rem;margin:0 auto;padding:5rem 1.25rem 2rem;'
        'color:#fff;font:16px/1.55 system-ui,sans-serif">'
        f"<h1>{escape(page['h1'])}</h1>{paragraphs}"
        "<p>Netto needs JavaScript to run. Please turn it on in your browser to play.</p>"
        f'<p>{links}</p></div></noscript>\n'
        f"{NOSCRIPT_END}"
    )


def apply_seo(source: str, route: str) -> str:
    """Zet de kop- en noscript-blokken van `route` in een HTML-bron met de markeringen."""
    if not HEAD_RE.search(source) or not NOSCRIPT_RE.search(source):
        raise ValueError("De HTML-bron mist de seo:begin/seo:end-markeringen")
    eol = "\r\n" if "\r\n" in source else "\n"
    # Een lambda voorkomt dat backslashes in de JSON als regex-verwijzing worden gelezen.
    source = HEAD_RE.sub(lambda _: head_block(route).replace("\n", eol), source, count=1)
    return NOSCRIPT_RE.sub(lambda _: noscript_block(route).replace("\n", eol), source, count=1)


def sitemap() -> str:
    urls = "\n".join(f"  <url><loc>{escape(page_url(route))}</loc></url>" for route in SITEMAP_ROUTES)
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{urls}\n</urlset>\n"
    )


def robots() -> str:
    return f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}sitemap.xml\n"


def not_found_page(source: str) -> str:
    """404.html gebruikt een absolute basis, want hij wordt op elke diepte getoond."""
    return re.sub(r'<base href="[^"]*">', lambda _: f'<base href="{SITE_URL}">', source, count=1)


# Bestanden in de project-root waarvan het seo-gedeelte met `--bron-bijwerken` wordt beheerd.
SOURCE_FILES = {"index.html": lambda source: apply_seo(source, ""), "404.html": not_found_page}


def update_sources(check: bool) -> int:
    stale = []
    for name, convert in SOURCE_FILES.items():
        path = ROOT / name
        if not path.is_file():
            continue
        # Bytes lezen en schrijven, zodat de regeleindes van het bestand (CRLF of LF) blijven staan.
        current = path.read_bytes().decode("utf-8")
        expected = convert(current)
        if expected != current:
            stale.append(name)
            if not check:
                path.write_bytes(expected.encode("utf-8"))
    if stale:
        print(("Verouderd: " if check else "Bijgewerkt: ") + ", ".join(stale))
        return 1 if check else 0
    print("Het seo-gedeelte van de bronbestanden is actueel.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--bron-bijwerken", action="store_true", help="schrijf het seo-gedeelte van index.html en 404.html in de root")
    group.add_argument("--bron-controleren", action="store_true", help="faal als dat gedeelte niet actueel is")
    args = parser.parse_args()
    return update_sources(check=args.bron_controleren)


if __name__ == "__main__":
    sys.exit(main())
