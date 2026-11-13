# Werkafspraken voor agents (Claude, Codex en andere)

## Git en GitHub
- Repo: `github.com/b-force-dev/Netto` (heette eerder `nettoo`) (organisatie heette eerder B-Force-Games).
- `main` = live site. `develop` = werkversie.
- **Begin altijd met bijwerken:** `git fetch origin` en zorg dat de lokale branch gelijk is aan GitHub voordat je wijzigt. Staat er ongecommit werk, zet het dan eerst veilig opzij (`git stash push -u -m "<omschrijving>"`) en meld dat.
- De lokale map is een kopie; GitHub is leidend. De gebruiker wil dat wijzigingen online komen, niet alleen lokaal.
- **Push naar `develop`** wanneer de gebruiker daarom vraagt.
- **Push naar `main` (live) alleen na expliciete toestemming.** Laat eerst zien welke wijzigingen meegaan.
- Commit geen losse hulpscripts of uitvoer (zoals `*.mjs`/`*.py` in de root, `outputs/`) tenzij daarom gevraagd wordt.

## Website-mirror
- De bron staat in de root (`index.html`, `css/`, `js/`, ...). De map `website/` is een kopie.
- Na wijzigingen aan frontendbestanden: eerst `python tools/verhoog_versies.py`, dan `python tools/sync_website.py`.
- `verhoog_versies.py` verhoogt de `?v=`-versie van elk gewijzigd CSS-, JS- en databestand (cache). Doe dat niet met de hand.
- Een nieuw CSS- of JS-bestand dat in de HTML staat, gaat vanzelf mee naar `website/`.

## Testen
- `node tests/daily-reliability.cjs` en `node tests/daily-server.cjs` moeten slagen.
- `tests/find-connection.cjs` en `tests/frontend_details.cjs` falen al langer (geen browseromgeving); dat is niet door jouw wijziging.

## Communicatie
- De gebruiker schrijft Nederlands; antwoord in eenvoudig Nederlands.
