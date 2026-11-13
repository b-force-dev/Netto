# Foto-aanvulling ronde 2 — 13 november 2026

Branch: `t3/add-library-puzzle-photos`, basis `2beac5d`, gelijk aan opgehaalde `origin/develop`. Geen push.

## Herstel vooraf

De bestaande hernoemingen bevatten de aangescherpte teksten al. De gegenereerde bank liep achter: 50 nieuwe teksten kregen bij regeneratie hun bestaande koppeling terug. De 72 oude sleutels die de generator anders verloor zijn expliciet in de uitzonderingenbron bewaard, zodat historische teksten hun beoordeling behouden. Nieuwe inhoudelijke afkeuringen hieronder gelden waar nodig ook voor die oude teksten.

Eén onjuiste soortkoppeling verwijderd (oude en nieuwe tekst): de foto van *Vombatus ursinus* past niet bij de aangescherpte vraag over de zuidelijke breedneuswombat. Daarvoor voorlopig bewust geen foto.

Na dit herstel slagen `node tests/photo-links.cjs` en `python tools/controleer_puzzels.py` (**ALLES IN ORDE**). Geen puzzelbestanden, frontendcode, cacheversies, mirror of Supabase aangepast.
