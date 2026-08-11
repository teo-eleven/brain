---
tags: [moc, sedinte]
created: 2026-08-11
type: moc
---

# MOC Ședințe

Ședințele pe Teams, ca noduri în graf. Fiecare ședință care produce o **decizie** sau un
**task** merită o notă; restul nu.

Șablon: `_templates/Meeting.md`. Notele se pun în `meetings/`, denumite
`AAAA-LL-ZZ - subiect.md` — data prima, ca să se sorteze singure.

> [!info] Ce intră și ce nu
> **Intră:** decizii luate, ce mi-a revenit mie, termene, blocaje ridicate, cine decide ce.
> **Nu intră:** transcrieri, conversații din chat, discuții personale. Vaultul e pe GitHub-ul
> personal — vezi [[Second Brain]]. Numele colegilor și adresele interne rămân în afara lui.

## Ședințe

<!-- Se listează singure pe măsură ce apar note în meetings/ -->

```dataview
TABLE file.day AS "Data", subiect AS "Subiect"
FROM "meetings"
SORT file.day DESC
LIMIT 15
```

## Ritm

- **QA AI Agent** — sincronizări pe partea de evaluare. Vezi [[QA AI Agent]]
- <!-- adaugă aici ședințele recurente, cu ziua și scopul lor -->

## Ce fac după o ședință

1. Notă în `meetings/` doar dacă a produs o decizie sau un task
2. Taskurile care-mi revin → în nota zilei, la `## Tasks`
3. Deciziile arhitecturale → notă separată în `decisions/`, vezi [[MOC Arhitectura]]
4. Ce am învățat → notă permanentă, nu în nota de ședință

## Legat

- [[MOC Vault - cum functioneaza]] · [[Dashboard]]
