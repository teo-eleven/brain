---
tags: [meta, convention]
created: 2026-08-06
type: permanent
---

# Conventii de denumire in vault

## Regulile din vaultul ăsta

**1. Nume de fișier fără diacritice.** Conținutul e în română cu diacritice complete, dar numele fișierelor sunt ASCII: `Migrari zero-downtime.md`, nu `Migrări`.

De ce: fișierele ajung în comenzi de shell, în git, în URL-uri, în scripturi. Diacriticele funcționează pe NTFS, dar produc probleme la codificare în tool-uri care nu se așteaptă la ele. Un cost mic de eleganță pentru zero bătăi de cap.

**2. Spații, nu cratime.** `Merge vs rebase.md`. Obsidian le gestionează nativ și titlul e citibil în graf și în quick switcher.

**3. Titlu = afirmație sau subiect scurt.** Vezi [[Nota atomica]]. Titluri lungi sunt greu de linkuit și umplu graful.

**4. Prefix `MOC ` pentru hărți.** `MOC Python.md`. Le găsești toate scriind „MOC" în `Ctrl+O`.

**5. Daily notes: `YYYY-MM-DD`.** Sortare cronologică gratuită, fără ambiguitate zi/lună.

**6. ADR-uri numerotate:** `ADR 001 - ...`. Numerele nu se refolosesc niciodată, chiar dacă un ADR e respins.

**7. Fără numere de ordine în alte note.** `01 Python.md` te obligă să renumerotezi când inserezi ceva. Ordinea se exprimă în MOC-uri.

## Frontmatter standard

```yaml
---
tags: [python, async]
created: 2026-08-06
type: permanent      # permanent | moc | daily | project | decision | snippet | source
---
```

`type` există ca să pot filtra cu Dataview. `created` nu se schimbă niciodată — pentru „modificat" există `file.mtime`.

## Tag-uri vs linkuri

**Linkurile sunt principalele. Tag-urile sunt secundare**, pentru filtrare transversală.

Un tag nu creează o legătură în graf și nu apare în backlinkuri. `#python` e util ca „arată-mi tot ce ține de Python"; `[[MOC Python]]` e util ca „unde se încadrează asta". Ai nevoie de ambele, dar dacă alegi unul, alege linkul.

Tag-uri folosite aici: `#seed` (incomplet), `#question` (nu înțeleg încă), `#todo`, `#ref`, plus tehnologii.

## Redenumirea

Obsidian actualizează automat toate linkurile la redenumire (`alwaysUpdateLinks: true` în config). Deci **redenumește liber** — nu e o operație riscantă. Excepție: dacă editezi fișiere din afara Obsidian (ex. cu Claude Code), linkurile nu se actualizează singure.

## Legături

- Face parte din: [[MOC Vault - cum functioneaza]]
- [[Nota atomica]] · [[MOC - map of content]]
- [[ADR 002 - Structura vault fara foldere adanci]]
