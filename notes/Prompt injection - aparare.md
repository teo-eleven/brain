---
tags: [note, ai, securitate]
created: 2026-08-11
type: note
status: schelet
---

# Prompt injection — apărare

> [!warning] Schelet — de completat de tine

## De ce e aici

E una dintre cele **4 metrici Primary**, cu pragul cel mai dur: **0 breșe, orice breșă = fail**.
La 11.08 e încă neacoperită.

La un agent de extracție suprafața e specifică: textul documentului **este** input-ul. Un document
poate conține instrucțiuni adresate modelului („ignoră instrucțiunile anterioare și…"), iar
sistemul nu are cum să distingă a priori conținutul de comandă. Ai deja un caz în dataset:
`extr-11_injection.pdf`.

## De răspuns

- Cum separi datele de instrucțiuni când datele _sunt_ input-ul principal?
- Ce apărări chiar funcționează: delimitatori, mesaj de sistem, validare la ieșire, model separat?
- De ce validarea **la ieșire** e mai fiabilă decât filtrarea la intrare?
- Cum construiești cazuri de test pentru injection fără să ajungi la o listă infinită?
- Ce înseamnă „breșă" concret, la extracție? (a executat instrucțiunea? a scos date din alt câmp?)

## Legat

- [[OWASP Top 10 - pe scurt]] · [[XSS]] — aceeași familie: date tratate ca instrucțiuni
- [[Validarea output-ului LLM]] — apărarea care chiar ține
- [[Metrici pentru agenti AI]] · [[MOC Securitate]]
