# Vragenbank en inhoudscatalogus

Netto heeft al een vragenbank. `vragen/vragen_review_compleet.xlsx`, blad
`Vragen`, bevat de redactionele bronvragen. De Library- en Connection-selecties
bevatten daarnaast specifieke speelversies. Race en Breinkrakers gebruiken
gegenereerde bestanden. De server bewaart de officiële Daily-planning apart.

`tools/audit_content.py` maakt deze lokale lagen samen doorzoekbaar. Het verandert
geen vraag, antwoord, selectie of site. De uitvoer is een **gegenereerde
inventaris**, niet een nieuwe leidende bank:

```powershell
python tools/audit_content.py
python tools/audit_content.py --check
```

De bestanden staan in `docs/audit/content_catalog.json` en
`docs/audit/content_quality.md`. `--check` schrijft niets en faalt als de uitvoer
ontbreekt of verouderd is. Draai opnieuw nadat bronbestanden veranderen.

## Wat de inventaris wel en niet zegt

- Elke oorspronkelijke ID, vindplaats, bron, bewijszin en bekende Engelse tekst
  blijft terug te vinden in de observaties. De Engelse zoekhulp uit het Excelblad
  is geen garantie dat die tekst ook in het spel verschijnt of goed vertaald is.
- Alleen gelijke Nederlandse tekst, na normalisatie van spaties en hoofdletters,
  wordt samengevoegd. Een herschreven vraag kan dus een tweede record worden.
  `catalog_id` is een teksthash, geen blijvende feit-ID. IDs zoals `q106` en
  `nr106` worden niet zonder bewijs gelijkgesteld.
- Een bronlink, `APPROVED`, ingevulde bewijszin of oude controledatum bewijst niet
  dat het feit in deze ronde extern gecontroleerd is. De tool claimt dat nergens.
- Oude open punten worden overgenomen uit het gestructureerde vervolgverslag,
  gekoppeld op ID of oude/nieuwe tekst. De JSON is hierbij leidend; een verouderde
  telling in een Markdown-verslag wordt geen nieuwe wachtlijst.
- Ontbrekende metadata wordt per verzamelde vraagtekst gemeld. De volledige
  observaties laten ook verschillen tussen bestandslagen zien. Aanwezigheid in
  één laag garandeert geen volledigheid van elke andere laag.
- Het verslag telt lege controlevelden, ontbrekende vastgelegde controledatums
  in selecties en oude bronwaarschuwingen apart. Dit zijn administratieve
  signalen, geen bewezen inhoudsfouten. De tabel toont maximaal vijftig punten,
  met vragen uit de onderzochte speelmodi vooraan; de JSON bewaart alle punten.
- Moeilijkheid en kennisratings blijven redactionele inschattingen. Numerieke
  signalen zijn alleen aanleidingen voor handmatige controle. Zonder spelersdata
  kan de tool niet vaststellen of een puzzel leuk of passend moeilijk is.

De catalogus sluit server-Dailies uit. Exporteer toekomstige Daily-antwoorden of
planning niet naar publieke frontendbestanden. De grote JSON is een intern
werkdocument en wordt niet door de website ingeladen.

## Naar een echte, blijvende feitenbank

Een duurzame volgende stap scheidt het **feit** van de **speelvraag**:

1. Een blijvende `fact_id`, onderwerp, afbakening, bronwaarde, broneenheid,
   peildatum en een bronpassage die juist die waarde ondersteunt.
2. Afzonderlijke bronstatus: `unreviewed`, `needs_review`, `verified` of
   `rejected`, met beoordelaar, controledatum en reden. Alleen een inhoudelijke
   broncontrole mag `verified` opleveren.
3. Een blijvende `question_id` per variant met Nederlandse en Engelse tekst,
   zichtbare eenheid, speelantwoord en expliciete afrondingsregel. Bijvoorbeeld:
   een bronwaarde van 19,86 miljoen wordt 20 miljoen als het spel om hele
   miljoenen vraagt; de oorspronkelijke bronwaarde blijft behouden.
4. Een apart redactioneel oordeel over herkenbaarheid, schatbaarheid,
   verrassingswaarde, benodigde kennis en geschikte modi. Een bewezen feit is
   niet automatisch een goede spelvraag.
5. Een puzzel verwijst naar vraag-IDs en legt het verband, niveau en de
   redactionele motivatie vast. Validatie toetst de som met de speelantwoorden,
   naast dubbelingen, eenheden en metadata.

Migreer bestaande tekstsleutels pas nadat de verwijzingen in generatoren,
vertalingen, bronnen en foto's samen kunnen worden bijgewerkt. Deze inventaris
doet die migratie bewust niet stilzwijgend.

## Praktische redactionele ronde

Werk eerst de bronconflicten en ontbrekende metadata af voor vragen die spelers
daadwerkelijk zien. Controleer bronwaarde, afbakening, peildatum en afronding
tegen de bron; vergelijk daarna NL/EN. Beoordeel vervolgens de combinatie:
een herkenbaar anker, iets dat je kunt benaderen en een verband dat echt helpt.
Test de eerste puzzels met nieuwe spelers en noteer waar zij redeneren, gokken
of afhaken. Gebruik dat om niveaus te ijken; het aantal cijfers alleen is
hiervoor onvoldoende.
