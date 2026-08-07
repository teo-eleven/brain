---
tags: [debugging, learning]
created: 2026-08-06
type: permanent
---

# Rubber duck debugging

## Ideea

Explici problema cu voce tare — unei rațe de plastic, unui coleg, unui LLM, pereților. Și găsești soluția în timp ce explici, adesea înainte să termini.

Sună stupid. Funcționează consistent și toți programatorii experimentați îl folosesc.

## De ce funcționează

**Citirea în minte sare peste pași; explicarea nu poate.**

Când citești cod în gând, creierul completează automat ce se așteaptă să fie acolo. Când verbalizezi, ești forțat să treci prin fiecare pas explicit — și acolo apare „stai, dar de unde vine valoarea asta?".

Al doilea mecanism: explicarea te obligă să treci de la modul „reparare" (îngust, fixat pe locul unde crezi că e problema) la modul „descriere" (larg, de la început). Fixația e cel mai mare dușman la debugging, iar verbalizarea o rupe.

## Cum o faci corect

Explică **de la început**, nu de la locul unde crezi că e bug-ul:

1. Ce ar trebui să facă sistemul
2. Ce face în schimb
3. Ce am verificat deja și ce am eliminat
4. Ce presupun — **aici apare de obicei răspunsul**

Pasul 4 e cel valoros. Bug-ul e aproape mereu într-o presupunere pe care n-ai verificat-o niciodată pentru că nici nu știai că o faci.

## Varianta scrisă e adesea mai bună

Scrisul e mai lent decât vorbitul, deci te forțează la mai multă precizie. Practic: începi să scrii un mesaj pe Slack sau o întrebare pe Stack Overflow, și la jumătate găsești răspunsul. Toată lumea a trăit asta.

De asta secțiunea „Ce am încercat" din `_templates/Bug log` există: e rubber duck cu urmă scrisă.

## Cu un LLM

Funcționează la fel de bine, cu un bonus: pune întrebări de clarificare, care sunt exact ce declanșează efectul. Și, în plus, uneori chiar știe răspunsul.

Nuanța: descrie problema complet **înainte** să ceri soluția. Dacă sari direct la „repară-mi asta", ratezi efectul rubber duck și primești un răspuns la întrebarea greșită.

## Legături

- Face parte din: [[MOC Invatare si Cariera]]
- [[Debugging metodic]] · [[Feynman technique]] — același mecanism, alt scop
