# Inhoudscatalogus en kwaliteitswachtrij

Gegenereerd met `python tools/audit_content.py`. Dit is een inventaris, geen nieuwe bronbank of afgeronde feitencontrole.

1539 unieke Nederlandse vraagteksten uit het reviewblad en de onderzochte openbare modi; 577 puzzels.
De server-Dailies en hun detailrecords vallen buiten deze lokale inventaris.

## Dekking

| Modus | Puzzels |
|---|---:|
| breinkrakers | 195 |
| connection | 60 |
| library | 112 |
| race | 210 |

## Vastgelegde broncontrole

| Dekking | Aantal |
|---|---:|
| connection_question_placements | 180 |
| connection_verification_date_missing | 60 |
| library_question_placements | 336 |
| library_verification_date_missing | 147 |
| review_control_missing | 1151 |
| review_rows | 1481 |

## Controlesignalen

| Signaal | Vraagteksten |
|---|---:|
| historical_review_warning | 90 |
| missing_question_en | 26 |
| review_control_missing | 1151 |
| unrecorded_selection_verification_date | 207 |

Een ingevulde bron of bewijszin betekent niet dat de bron tijdens deze ronde is gecontroleerd. Een oude open auditmelding moet opnieuw worden beoordeeld; zij is geen automatisch afkeuringsbesluit.

## Vragen die aandacht vragen

| Vraag | Antwoord(en) | Signalen | Vindplaatsen |
|---|---|---|---|
| Hoeveel afleveringen telt de originele Britse serie The Office (inclusief specials)? | [14] | historical_review_warning | breinkrakers:bk-2, race:pool-265, vragen/vragen_review_compleet.xlsx#Vragen!194 |
| Hoeveel bijen leven er in een sterk bijenvolk in de zomer? | [50000] | review_control_missing, historical_review_warning | breinkrakers:bk-166, race:pool-029, vragen/vragen_review_compleet.xlsx#Vragen!1019 |
| Hoeveel botten bevat één menselijke hand inclusief de pols? | [27] | review_control_missing, unrecorded_selection_verification_date, historical_review_warning | connection:ea602197-7b4f-5313-b078-15b90e066266, race:pool-223, vragen/vragen_review_compleet.xlsx#Vragen!107 |
| Hoeveel botten heeft een volwassen mens? | [206] | review_control_missing, historical_review_warning | library:c56fd471-9647-54e5-b15f-9c850bb0eeb7, vragen/vragen_review_compleet.xlsx#Vragen!108 |
| Hoeveel botten heeft een volwassen menselijke schedel? | [22] | review_control_missing, unrecorded_selection_verification_date, historical_review_warning | connection:82142cf5-0bed-50c1-9972-77ab19311b19, race:pool-027, vragen/vragen_review_compleet.xlsx#Vragen!109 |
| Hoeveel botten zitten er in één menselijke voet en enkel? | [26] | review_control_missing, unrecorded_selection_verification_date, historical_review_warning | library:7fba9913-d191-5436-b429-2a2011ac848e, race:pool-258, vragen/vragen_review_compleet.xlsx#Vragen!594 |
| Hoeveel chromosomenparen heeft een huiskat normaal? | [19] | review_control_missing, historical_review_warning | library:43b8ea8c-c54d-5c97-b826-31a7a6f97d6f, vragen/vragen_review_compleet.xlsx#Vragen!161 |
| Hoeveel compartimenten heeft de maag van een geit? | [4] | historical_review_warning | library:84872707-2389-5c5c-be88-9b07b9669211, vragen/vragen_review_compleet.xlsx#Vragen!629 |
| Hoeveel duizend vierkante kilometer groot is Australië? | [7692] | review_control_missing, historical_review_warning | breinkrakers:bk-100, breinkrakers:bk-99, race:pool-189, vragen/vragen_review_compleet.xlsx#Vragen!934 |
| Hoeveel eieren zitten er in een gebruikelijke Amerikaanse winkelverpakking? | [12] | review_control_missing, historical_review_warning | race:pool-251, vragen/vragen_review_compleet.xlsx#Vragen!190 |
| Hoeveel elektronen kan de derde elektronenschil maximaal bevatten? | [18] | review_control_missing, historical_review_warning | race:pool-167, vragen/vragen_review_compleet.xlsx#Vragen!1228 |
| Hoeveel gekleurde vierkantjes zitten er op een Rubiks kubus? | [54] | review_control_missing, unrecorded_selection_verification_date, historical_review_warning | library:8dd775da-caa0-5a68-8045-2f20e1424ea3, vragen/vragen_review_compleet.xlsx#Vragen!1237 |
| Hoeveel haren heeft een mens gemiddeld op zijn hoofd? | [100000] | review_control_missing, unrecorded_selection_verification_date, historical_review_warning | library:48f6a706-3b3a-50bd-b059-c0ed303f6816, race:pool-191, vragen/vragen_review_compleet.xlsx#Vragen!114 |
| Hoeveel hotels had Hilton eind 2023 wereldwijd ongeveer? | [7500] | review_control_missing, historical_review_warning | breinkrakers:bk-124, breinkrakers:bk-60, race:pool-025, vragen/vragen_review_compleet.xlsx#Vragen!1223 |
| Hoeveel jaar duurde de bouw van de Dom van Keulen? | [632] | review_control_missing, historical_review_warning | race:pool-071, vragen/vragen_review_compleet.xlsx#Vragen!749 |
| Hoeveel kamers heeft de maag van een koe? | [4] | review_control_missing, unrecorded_selection_verification_date, historical_review_warning | connection:2fc5e871-a463-52c4-b6aa-624c92622005, race:pool-082, vragen/vragen_review_compleet.xlsx#Vragen!152 |
| Hoeveel kilogram voedsel (bladeren, gras, takken) eet een volwassen Afrikaanse olifant per dag? | [150] | review_control_missing, historical_review_warning | breinkrakers:bk-166, race:pool-017, vragen/vragen_review_compleet.xlsx#Vragen!631 |
| Hoeveel kilometer lang is de Kanaaltunnel? | [50] | historical_review_warning | breinkrakers:bk-55, vragen/vragen_review_compleet.xlsx#Vragen!561 |
| Hoeveel kilometer lang is de Nederlandse kustlijn ongeveer? | [451] | historical_review_warning | race:pool-042, vragen/vragen_review_compleet.xlsx#Vragen!406 |
| Hoeveel kilometer lang is de kust van de Nederlandse Waddeneilanden ongeveer? | [300] | historical_review_warning | race:pool-268, vragen/vragen_review_compleet.xlsx#Vragen!1112 |
| Hoeveel kilometer lang is de kustlijn van Canada ongeveer? | [202080] | historical_review_warning | breinkrakers:bk-172, breinkrakers:bk-183, breinkrakers:bk-188, vragen/vragen_review_compleet.xlsx#Vragen!824 |
| Hoeveel kilometer lang is de kustlijn van Japan ongeveer? | [29750] | historical_review_warning | breinkrakers:bk-113, vragen/vragen_review_compleet.xlsx#Vragen!267 |
| Hoeveel landen vormen de G20? | [19] | review_control_missing, historical_review_warning | breinkrakers:bk-131, vragen/vragen_review_compleet.xlsx#Vragen!174 |
| Hoeveel letters kent de internationale morsecode? | [26] | review_control_missing, historical_review_warning | breinkrakers:bk-190, race:pool-231, vragen/vragen_review_compleet.xlsx#Vragen!531 |
| Hoeveel maagcompartimenten heeft een schaap? | [4] | review_control_missing, historical_review_warning | breinkrakers:bk-4, race:pool-067, vragen/vragen_review_compleet.xlsx#Vragen!158 |
| Hoeveel magen heeft een koe? | [4] | review_control_missing, historical_review_warning | breinkrakers:bk-139, vragen/vragen_review_compleet.xlsx#Vragen!646 |
| Hoeveel mensen dienden in de Amerikaanse strijdkrachten in WO II? | [16000000] | review_control_missing, unrecorded_selection_verification_date, historical_review_warning | library:bce0db8f-718a-5781-bbd7-2998bc1c0f56, race:pool-160, vragen/vragen_review_compleet.xlsx#Vragen!959 |
| Hoeveel mensen jongleerden tegelijk bij het record in Edinburgh in 1998? | [1508] | review_control_missing, historical_review_warning | race:pool-137, vragen/vragen_review_compleet.xlsx#Vragen!1218 |
| Hoeveel meter hoog is One World Trade Center? | [541] | historical_review_warning | breinkrakers:bk-111, breinkrakers:bk-112, vragen/vragen_review_compleet.xlsx#Vragen!228 |
| Hoeveel meter hoog is Taipei 101? | [508] | unrecorded_selection_verification_date, historical_review_warning | library:c668d0e3-92d1-5d96-b1cd-baf6766aef04, race:pool-005, vragen/vragen_review_compleet.xlsx#Vragen!229 |
| Hoeveel meter hoog is de CN Tower? | [553] | historical_review_warning | breinkrakers:bk-136, breinkrakers:bk-177, breinkrakers:bk-23, breinkrakers:bk-81 |
| Hoeveel meter hoog is de Christus de Verlosser inclusief sokkel? | [38] | historical_review_warning | breinkrakers:bk-103, race:pool-253, vragen/vragen_review_compleet.xlsx#Vragen!761 |
| Hoeveel meter hoog is het Vrijheidsbeeld inclusief voetstuk? | [93] | historical_review_warning | breinkrakers:bk-20, race:pool-208, vragen/vragen_review_compleet.xlsx#Vragen!349 |
| Hoeveel meter hoog is het hoogste punt van het Millauviaduct? | [343] | historical_review_warning | breinkrakers:bk-166, race:pool-085, vragen/vragen_review_compleet.xlsx#Vragen!231 |
| Hoeveel meter lang is de hoofdoverspanning van de Golden Gate Bridge? | [1280] | historical_review_warning | race:pool-120, vragen/vragen_review_compleet.xlsx#Vragen!751 |
| Hoeveel meter lang is het Millauviaduct in Frankrijk? | [2460] | historical_review_warning | race:pool-012, vragen/vragen_review_compleet.xlsx#Vragen!235 |
| Hoeveel meter overspant de boog van de Van Brienenoordbrug, afgerond op honderdtallen? | [300] | historical_review_warning | race:pool-267, vragen/vragen_review_compleet.xlsx#Vragen!1110 |
| Hoeveel miljard neuronen (zenuwcellen) bevat het menselijk brein naar schatting? | [86] | review_control_missing, historical_review_warning | breinkrakers:bk-17, breinkrakers:bk-18, breinkrakers:bk-76, breinkrakers:bk-77 |
| Hoeveel miljoen ton groene koffiebonen produceerde de wereld in 2023? | [11] | review_control_missing, historical_review_warning | race:pool-269, vragen/vragen_review_compleet.xlsx#Vragen!357 |
| Hoeveel noten bevat een standaard majeurtoonladder inclusief het herhaalde octaaf? | [8] | review_control_missing, historical_review_warning | race:pool-071, vragen/vragen_review_compleet.xlsx#Vragen!381 |
| Hoeveel paar ribben heeft een mens normaal? | [12] | review_control_missing, unrecorded_selection_verification_date, historical_review_warning | library:682fe651-6940-5a7d-a329-b2775eafbd6e, race:pool-163, vragen/vragen_review_compleet.xlsx#Vragen!120 |
| Hoeveel pixels breed is een standaard 4K Ultra HD videoscherm? | [3840] | review_control_missing, unrecorded_selection_verification_date, historical_review_warning | breinkrakers:bk-199, library:fe6ba2f6-b138-5c35-a445-365b015fd53a, vragen/vragen_review_compleet.xlsx#Vragen!538 |
| Hoeveel poten heeft een spin? | [8] | review_control_missing, historical_review_warning | race:pool-253, vragen/vragen_review_compleet.xlsx#Vragen!163 |
| Hoeveel primaire kleuren gebruikt het RGB-kleurenmodel? | [3] | historical_review_warning | library:63edab7d-a52a-52d0-b8e5-9dd016ba7031, vragen/vragen_review_compleet.xlsx#Vragen!1358 |
| Hoeveel procent van Nederland ligt onder zeeniveau? | [26] | review_control_missing, unrecorded_selection_verification_date, historical_review_warning | breinkrakers:bk-24, library:48a68edd-3eca-59d0-abe3-128b2256a9a6, race:pool-260, vragen/vragen_review_compleet.xlsx#Vragen!1139 |
| Hoeveel procent van de natuurlijke wetlands verdween tussen 1700 en 2022? | [85] | review_control_missing, historical_review_warning | breinkrakers:bk-184, breinkrakers:bk-23, race:pool-102, vragen/vragen_review_compleet.xlsx#Vragen!1041 |
| Hoeveel procent van ons voedsel gaat verloren of wordt verspild? | [33] | review_control_missing, historical_review_warning | race:pool-067, vragen/vragen_review_compleet.xlsx#Vragen!374 |
| Hoeveel ribben heeft een menselijk lichaam in totaal? | [24] | review_control_missing, historical_review_warning | race:pool-099, vragen/vragen_review_compleet.xlsx#Vragen!601 |
| Hoeveel rijtuigen vormen een Eurostar e320-trein? | [16] | historical_review_warning | connection:be252eeb-0a1f-5449-867e-448f6ffb7d3d, vragen/vragen_review_compleet.xlsx#Vragen!574 |
| Hoeveel soldaten vochten tijdens de Slag om Gettysburg ongeveer mee? | [165000] | review_control_missing, historical_review_warning | race:pool-032, vragen/vragen_review_compleet.xlsx#Vragen!331 |

Getoond: maximaal 50 van 1216 vraagteksten met controlesignalen, actieve vragen eerst. De volledige wachtrij staat in de JSON.
Ontbrekende controlevelden of datums zijn ontbrekend bewijs in de administratie, geen bewijs dat een antwoord fout is. Oude waarschuwingen kunnen inmiddels zijn opgelost.


## Moeilijkheid

De bestaande niveaus zijn redactioneel. Grote getallen en het getal 1 worden alleen als handmatige controlesignalen gemeld; zij maken een puzzel niet automatisch slecht of moeilijk.
Kennis van het onderwerp, herkenbaarheid, schatbaarheid en plezier zijn niet betrouwbaar uit het antwoordgetal af te leiden. Beoordeel die per vraag en test ze met nieuwe spelers.

Aanbevolen puzzelcontrole: minstens één herkenbaar anker; de andere antwoorden moeten te benaderen zijn; de som moet helpen; geen drie specialistische feiten; een verrassende maar verdedigbare onthulling.

Niet gekoppelde historische open punten: 0. Zie JSON voor de volledige provenance.
