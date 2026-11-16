# Nieuwe schatpuzzelreeks

## Harde afspraken

- Doel: maximaal 100 puzzels; liever minder dan zwakke of onbetrouwbare combinaties.
- Elke vraag komt maximaal eenmaal voor. Varianten van een onderwerp, zoals chromosomen en chromosomenparen, mogen wel; hetzelfde antwoordfeit tweemaal niet.
- Overlap met de bestaande Library mag; deze selectie vervangt die niet automatisch.
- Legendary: drie sterke vragen. Bijna legendary: twee sterke en één normale.
- Normaal: één sterke en twee normale. Drie normale vragen worden niet opgenomen.
- Sterk betekent een voorstelbare maar onzekere schaal waarbij nauwkeurig schatten voldoening geeft. Een obscuur telweetje is niet automatisch sterk.
- Eerst de beste legendary combinaties zoeken; resterende vragen gebruiken voor de andere klassen.
- Antwoorden worden niet gewijzigd of speciaal afgerond om een rekensom passend te maken.
- De spelersselectie behoudt de twintig combinaties die minstens twee van drie reviewers leuk vonden. De 22 twijfelgevallen worden per volledige combinatie herbeoordeeld; een bekend antwoord mag een bruikbaar anker zijn. De 88 pianotoetsen in puzzel 7 blijven daarom staan.
- Een vervangvraag moet al hetzelfde antwoord in de bank hebben, extern bevestigd zijn en mag geen vraag of bronfeit uit een andere behouden puzzel herhalen. De som en de drie speelantwoorden blijven gelijk.

## Bestanden en herkomst

`kandidaten_a.json`, `kandidaten_b.json` en `kandidaten_c.json` bewaren de onafhankelijke voorstellen. Dezelfde combinatie bij twee agents is een redactioneel signaal, geen onafhankelijke feitenverificatie.

`review.json` beoordeelt de eerste voorstellen en registreert bronrisico's en bekende semantische dubbelen. Zijn aantallen zijn geen eindtelling: de selectie is daarna uitgebreid.

`unieke_a.json` en `extra_b.json` documenteren de zoekruimte en haalbaarheidsanalyse. Ruwe matches daarin zijn niet allemaal goede spelpuzzels.

`selectie.json` is de uiteindelijke redactionele set. De begrijpelijke weergave staat in `docs/audit/legendary_selectie.md`. Het bestand vermeldt eerlijk wanneer een tussenselectie het doel van 100 nog niet haalt.

`redactie.json` bewaart de 300 oorspronkelijke NL/EN-redacties, de oorspronkelijke combinaties van commit `376e308`, beoordelingen per vraag en redenen om puzzels te schrappen. Het oudere solverbestand `tier_selectie_a.json` reproduceert die opgeslagen selectie niet; daarom heeft de vastgelegde oorspronkelijke selectie voorrang. Bankantwoorden, IDs en oorspronkelijke bronlinks blijven intact. Een vervangvraag neemt haar eigen bank-ID en bron mee; `question_replacements` koppelt die aan het oorspronkelijke vraag-ID. Een nieuwe controlebron staat apart onder `source_review`.

`player_review` legt de twintig vaste puzzelnummers en het besluit over elk van de 22 twijfelgevallen vast. `question_replacements` bevat de vervangende bankvragen, korte NL/EN-teksten en de reden. Genereren past deze besluiten opnieuw toe; controles bewaken gelijke antwoorden, uniciteit, bronbevestiging en het behoud van de twintig vaste combinaties. De tiers blijven een afzonderlijke redactionele indeling en zijn geen cijfer voor speelplezier.

## Bronnen en publicatie

De bestaande bank bevat bronlinks en bewijszinnen, maar die zijn niet allemaal opnieuw extern gecontroleerd. De selectie is daarom voorbereide inhoud, geen automatische publicatie of certificering. Controleer voor publicatie bronwaarde, peildatum, meetdefinitie, afronding en Engelse vraagtekst. Een gelijkheid tussen speelgetallen maakt benaderde natuurwaarden niet exact.

`verified` betekent extern bevestigd; `verified_rounded` vermeldt de bronwaarde en omrekening of bestaande afronding. `checked_unresolved` betekent een controlepoging zonder voldoende bewijs. `rejected_incorrect` en `rejected_ambiguous` onderbouwen een afwijzing. Geen van deze laatste drie statussen mag in de selectie staan. Normale vragen die niet opnieuw onderzocht zijn houden `requires_external_review`; een oude banknotitie telt niet als nieuwe controle. Alle vragen uit de oorspronkelijke twee hoogste tiers hebben een controlerecord; een onopgeloste vraag leidt tot het schrappen van haar combinatie.

Dagpuzzelplanning en toekomstige antwoorden uit de server worden niet gebruikt. De website laadt deze werkbestanden niet in.

## Gereedschap

De zoektools gebruiken Python, pandas/openpyxl en SciPy (getest met SciPy 1.16.3). De finale inhoudscontrole gebruikt pandas/openpyxl:

```powershell
python tools/controleer_legendary.py
python tools/maak_legendary_selectie.py --check
```

Zonder `--check` genereert `maak_legendary_selectie.py` de selectie en het auditverslag opnieuw uit de vastgelegde redactie. Het wijzigt geen antwoorden en publiceert niets. De controles toetsen ook lege Engelse teksten, bekende vertaalfouten, uniciteit per ID en bronfeit, exacte sommen, tiers en bewijsmetadata. De nummering bewaart de oorspronkelijke puzzelnummers, inclusief gaten na schrappen.

De zoekruimte kan opnieuw worden onderzocht met de `legendary_search_*.py`-scripts. Een tijdbegrensde solver levert niet altijd exact dezelfde selectie of een bewezen optimum; solverstatus en beperkingen horen daarom bij het resultaat.

## Ronde 2 en correctie van 16 november 2026

`selectie_ronde2.json` en `redactie_ronde2.json` bevatten 30 nieuwe combinaties (8 legendary, 12 near-legendary, 10 normaal), met 90 bevestigde feiten en voorgestelde datums van 16 december 2026 tot en met 14 januari 2027. Het verslag staat in `docs/audit/legendary_selectie_ronde2.md`. Niets is ingepland. Deze nieuwe feiten worden zelfstandig gecontroleerd; de oude generator blijft alleen ronde 1 opbouwen.

Uitzondering op het historische behoud van twintig puzzels: puzzel 18 is ingetrokken na controle bij NPS. De gecorrigeerde Grand Canyon-diepte is 1829 m; de oude som met 1857 klopt dan niet meer. `redactie.json` bewaart de correctie onder `fact_corrections` en de oude waarden uitsluitend als historische herkomst. Ronde 1 telt nu 29 combinaties. Supabase is niet gewijzigd.

`python tools/controleer_legendary.py` controleert beide reeksen, ook onderlinge vraag-ID’s, EN/NL-teksten en bronfeiten. Niveaus en bekende ankers blijven redactionele oordelen; de controle bewaakt hun vastgelegde regels.
