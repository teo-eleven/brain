---
tags: [moc, sedinte]
created: 2026-08-11
type: moc
---

# MOC Ședințe

Parte din [[MOC AI Engineer]]. Meet-urile de pe Teams, ca noduri în graf.

Notă doar pentru ședințele care produc o **decizie** sau un **task**. Restul nu merită nod.

Convenție: `meetings/AAAA-LL-ZZ - subiect.md` — data prima, ca să se sorteze singure.
Șablon: `_templates/Meeting.md`.

> [!warning] Ce nu intră
> Transcrieri, conversații din chat, discuții personale, **nume de colegi**, adrese interne.
> Vaultul e pe GitHub-ul personal. Scrii „un coleg", „coordonatorul" — decizia contează, nu cine
> a spus-o.

## Ședințe

```dataview
TABLE file.day AS "Data", subiect AS "Subiect"
FROM "meetings"
SORT file.day DESC
LIMIT 15
```

## Ritm

- **QA AI Agent** — sincronizări pe partea de evaluare. Vezi [[QA AI Agent]]
- <!-- adaugă aici ședințele recurente, cu ziua și scopul lor -->

## După o ședință, în ordine

1. Notă în `meetings/` — doar dacă a produs o decizie sau un task
2. Taskurile care-mi revin → în nota zilei, la `## Tasks`
3. Deciziile tehnice → notă separată în `decisions/`
4. Ce am învățat → notă permanentă în `notes/`, **nu** în nota de ședință

## Legat

- [[MOC Operatii zilnice]] · [[MOC Vault]]
