# Werkafspraken voor agents (Claude, Codex en andere)

## Git en GitHub
- Repo: `github.com/b-force-dev/nettoo` (organisatie heette eerder B-Force-Games).
- `main` = live site. `develop` = werkversie.
- **Begin altijd met bijwerken:** `git fetch origin` en zorg dat de lokale branch gelijk is aan GitHub voordat je wijzigt. Staat er ongecommit werk, zet het dan eerst veilig opzij (`git stash push -u -m "<omschrijving>"`) en meld dat.
- De lokale map is een kopie; GitHub is leidend. De gebruiker wil dat wijzigingen online komen, niet alleen lokaal.
- **Push naar `develop`** wanneer de gebruiker daarom vraagt.
- **Push naar `main` (live) alleen na expliciete toestemming.** Laat eerst zien welke wijzigingen meegaan.
- Commit geen losse hulpscripts of uitvoer (zoals `*.mjs`/`*.py` in de root, `outputs/`) tenzij daarom gevraagd wordt.

## Website-mirror
- De bron staat in de root (`index.html`, `css/`, `js/`, ...). De map `website/` is een kopie.
- Na wijzigingen aan frontendbestanden: `python tools/sync_website.py`.
- Verhoog bij gewijzigde CSS/JS de `?v=`-versie in de HTML die het bestand laadt (cache).

## Testen
- `node tests/daily-reliability.cjs` en `node tests/daily-server.cjs` moeten slagen.
- `tests/find-connection.cjs` en `tests/frontend_details.cjs` falen al langer (geen browseromgeving); dat is niet door jouw wijziging.

## Communicatie
- De gebruiker schrijft Nederlands; antwoord in eenvoudig Nederlands.
