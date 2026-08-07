---
tags: [adr, meta]
created: 2026-08-06
type: decision
status: accepted
---

# ADR 002 — Structura vault fără foldere adânci

> **Status:** accepted · **Data:** 2026-08-06 · **Proiect:** [[Second Brain]]

## Context

Reflexul natural, venind din programare, e să organizez notele în ierarhii: `notes/backend/python/async/`. Problema: o notă aparține adesea la mai multe locuri simultan, iar un fișier stă într-un singur folder.

[[Idempotenta in API]] aparține la fel de mult în „backend" cât în „arhitectură". Cu foldere trebuie să aleg, și alegerea e arbitrară — apoi nu mai găsesc nota pentru că am ales altfel decât aș căuta.

## Decizia

**Un singur nivel de foldere, pe tip de notă**, nu pe temă:

```
daily/  notes/  maps/  projects/  cheatsheets/  snippets/
decisions/  people/  weekly/  inbox/  _templates/  attachments/
```

Toate notele permanente stau împreună în `notes/`, plat. **Organizarea pe teme se face prin MOC-uri** — vezi [[MOC - map of content]].

## Alternative considerate

| Alternativă | De ce nu |
|---|---|
| Foldere pe temă (`python/`, `backend/`) | o notă aparține la mai multe teme; alegerea devine arbitrară |
| Un singur folder plat, absolut tot | daily notes și template-urile poluează căutarea și graful |
| Foldere adânci (3-4 nivele) | navigare lentă, mutări constante, cale lungă în linkuri |
| Doar tag-uri, fără foldere | tag-urile nu apar în graf și nu creează backlinkuri |

## Consecințe

**Bune:**
- o notă poate apărea în oricâte MOC-uri
- nu pierd timp decizând „în ce folder pun asta" — răspunsul e determinat de tip, nu de judecată
- linkurile `[[Nota]]` funcționează fără cale (`newLinkFormat: shortest`)
- graful colorat pe cale rămâne lizibil: fiecare culoare = un tip de notă
- mutarea unei note între foldere e rară, deci linkurile sunt stabile

**Rele (acceptate conștient):**
- `notes/` va avea sute de fișiere. Fără MOC-uri și fără `Ctrl+O`, ar fi de nenavigat.
- **depinde de disciplina de a face MOC-uri.** Dacă nu le întrețin, structura dispare și rămâne o grămadă plată.
- File explorer-ul devine inutil ca instrument de navigare — navighezi prin quick switcher, căutare și linkuri.

## Reguli care decurg

- Nume fără diacritice, cu spații — vezi [[Conventii de denumire in vault]]
- MOC nou la ~5-7 note pe o temă, nu înainte
- Maxim 3 nivele în ierarhia de MOC-uri: [[Dashboard]] → [[MOC Programare]] → MOC specific

## Când s-ar reconsidera

- Dacă `notes/` depășește ~500 de fișiere și căutarea devine lentă → sub-foldere pe domenii largi (`notes/tech/`, `notes/personal/`)
- Dacă adaug un domeniu complet nelegat de programare (rețete, finanțe personale) → folder separat de nivel 1, nu amestecat în `notes/`

## Legături

- [[Second Brain]] · [[ADR 001 - Vault local markdown pe D]]
- [[MOC - map of content]] · [[Conventii de denumire in vault]]
