# Vragenaudit van 12–13 november 2026

Dit is het verslag van de kwaliteitsronde over alle vragen die spelers in de openbare bestanden kunnen zien: de bibliotheek, Find the Connection, de racepool en de kettingpuzzels.

**Let op: de ronde is niet volledig afgemaakt.** Twee agents werkten eraan en beide zijn onderbroken (herstart van de server, daarna de gebruikslimiet van Codex). Wat hieronder staat is gedaan en gecontroleerd met `python tools/controleer_puzzels.py`. De lijst "Open punten per vraag" noemt wat nog nagekeken moet worden; dat een vraag daar niet staat, betekent niet dat het feit extern is bevestigd.

Wat er is gedaan:

- Vraagteksten zijn eenduidiger gemaakt: eenheid en afbakening staan nu in de vraag ("Hoeveel meter hoog…", "…in juli 2026").
- Bij elke gewijzigde Nederlandse tekst is ook de Engelse tekst en de Engelse bewijszin bijgewerkt. Engels is de hoofdtaal.
- Antwoorden zijn alleen gewijzigd waar een bron het oude antwoord tegenspreekt; puzzels waarvan de som daardoor niet meer klopte zijn vervangen of vervallen.
- Een hernoemde vraag behoudt haar foto: `vragen/hernoemingen_fotos.json` koppelt de nieuwe tekst aan de oude fotosleutel.
