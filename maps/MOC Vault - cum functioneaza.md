---
tags: [moc, meta]
created: 2026-08-06
type: moc
---

# MOC Vault - cum functioneaza

Meta-harta: cum funcționează sistemul, nu ce e în el. Parte din [[MOC Programare]].

## Conceptele

- [[Nota atomica]] — unitatea de bază
- [[MOC - map of content]] — de ce hărți în loc de foldere
- [[Zettelkasten pe scurt]] — originea metodei
- [[Cum scriu o nota permanenta]] — procedura concretă

## Igiena

- [[Note orfane]] — cum le găsești și de ce contează
- [[Conventii de denumire in vault]]
- [[Graph view - ce e util]] — și ce e doar spectaculos

## Referință

- [[Obsidian cheatsheet]]
- [[00 START HERE]]
- [[Dashboard]]

## Deciziile din spatele setup-ului

- [[ADR 001 - Vault local markdown pe D]]
- [[ADR 002 - Structura vault fara foldere adanci]]

## Automatizare

- [[Sincronizare vault cu commit-urile git]] — commit-urile zilei intră singure în daily note,
  iar notele atinse se colorează în graf

## Proiectul

- [[Second Brain]] — vaultul ca proiect: ce automatizez, ce nu

## De experimentat #question

- [x] Scriere automată în daily note a ce am lucrat — rezolvat cu `scripts/sync-daily.ps1`,
      vezi [[Sincronizare vault cu commit-urile git]]
- [x] Backup automat — rezolvat cu git + remote privat, **înlocuiește** decizia din
      [[ADR 001 - Vault local markdown pe D]]
- [ ] Dataview: dashboard per proiect
- [ ] Merită Templater pentru linkuri ieri/mâine în daily note?
- [ ] Task Scheduler: să ruleze `sync-daily.ps1` singur, la o oră fixă
