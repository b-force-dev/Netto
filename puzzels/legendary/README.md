# Nieuwe schatpuzzelreeks

## Harde afspraken

- Doel: 100 puzzels met samen 300 verschillende vragen.
- Elke vraag en elk semantisch bronfeit komt maximaal eenmaal in de nieuwe reeks voor.
- Overlap met de bestaande Library mag; deze selectie vervangt die niet automatisch.
- Legendary: drie sterke vragen. Bijna legendary: twee sterke en één normale.
- Normaal: één sterke en twee normale. Drie normale vragen worden niet opgenomen.
- Sterk betekent een voorstelbare maar onzekere schaal waarbij nauwkeurig schatten voldoening geeft. Een obscuur telweetje is niet automatisch sterk.
- Eerst de beste legendary combinaties zoeken; resterende vragen gebruiken voor de andere klassen.
- Antwoorden worden niet gewijzigd of speciaal afgerond om een rekensom passend te maken.

## Bestanden en herkomst

`kandidaten_a.json`, `kandidaten_b.json` en `kandidaten_c.json` bewaren de onafhankelijke voorstellen. Dezelfde combinatie bij twee agents is een redactioneel signaal, geen onafhankelijke feitenverificatie.

`review.json` beoordeelt de eerste voorstellen en registreert bronrisico's en bekende semantische dubbelen. Zijn aantallen zijn geen eindtelling: de selectie is daarna uitgebreid.

`unieke_a.json` en `extra_b.json` documenteren de zoekruimte en haalbaarheidsanalyse. Ruwe matches daarin zijn niet allemaal goede spelpuzzels.

`selectie.json` is de uiteindelijke redactionele set. De begrijpelijke weergave staat in `docs/audit/legendary_selectie.md`. Het bestand vermeldt eerlijk wanneer een tussenselectie het doel van 100 nog niet haalt.

## Bronnen en publicatie

De bestaande bank bevat bronlinks en bewijszinnen, maar die zijn niet allemaal opnieuw extern gecontroleerd. De selectie is daarom voorbereide inhoud, geen automatische publicatie of certificering. Controleer voor publicatie bronwaarde, peildatum, meetdefinitie, afronding en Engelse vraagtekst. Een gelijkheid tussen speelgetallen maakt benaderde natuurwaarden niet exact.

Dagpuzzelplanning en toekomstige antwoorden uit de server worden niet gebruikt. De website laadt deze werkbestanden niet in.

## Gereedschap

De zoektools gebruiken Python, pandas/openpyxl en SciPy (getest met SciPy 1.16.3). De finale inhoudscontrole gebruikt pandas/openpyxl:

```powershell
python tools/controleer_legendary.py
```

De zoekruimte kan opnieuw worden onderzocht met de `legendary_search_*.py`-scripts. Een tijdbegrensde solver levert niet altijd exact dezelfde selectie of een bewezen optimum; solverstatus en beperkingen horen daarom bij het resultaat.
