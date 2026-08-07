---
tags: [project, meta]
created: 2026-08-06
type: project
status: active
---

# Second Brain

> **Status:** active · **Început:** 2026-08-06 · **Locație:** `D:\teodor.fotciuc\brain`

## Într-o propoziție

Un vault Obsidian local, în markdown, care adună tot ce învăț și lucrez, legat prin linkuri în loc de foldere.

## De ce am început

Recomandare de la [[Indrumator]], care îl folosește pentru management de zi, informații, căutări și tot ce lucrează. Vezi [[Zettelkasten pe scurt]] pentru originea metodei.

## Stack

- **Obsidian** — gratuit, fișiere locale, markdown pur
- **Markdown + frontmatter YAML** — fără format proprietar
- Opțional: Dataview pentru query-uri

**Fără git.** Vaultul e personal, nu are nevoie de versionare, PR-uri sau istoric de commit-uri. Decizie luată explicit pe 2026-08-06 — vezi [[ADR 001 - Vault local markdown pe D]].

## Unde e

- Vault: `D:\teodor.fotciuc\brain`
- Descărcări: `D:\teodor.fotciuc\downloads`
- Config: `D:\teodor.fotciuc\brain\.obsidian\` (în vault, deci versionabil)

## Starea actuală

<!-- Actualizat: 2026-08-06 -->

- Structura de foldere și `.obsidian` pre-configurat: **gata**
- 126 note de start, 953 linkuri: **gata**
- 9 template-uri: **gata**
- **Obsidian 1.13.4 instalat**: `%LOCALAPPDATA%\Programs\Obsidian` — **gata**
- Vaultul înregistrat în `%APPDATA%\obsidian\obsidian.json` — **gata**
- Dataview instalat: **nu** (query-urile din [[Dashboard]] apar ca text până atunci)
- Git: **nu, decizie luată** — vaultul nu se versionează

## Următorii pași

- [ ] Deschis vaultul în Obsidian (click pe `brain` în vault picker)
- [ ] Verificat că plugin-urile core sunt active (daily notes, templates, graph)
- [ ] **Două săptămâni: doar daily notes.** Nimic altceva. Vezi [[00 START HERE]].
- [ ] După 2 săptămâni: instalez Dataview, mă uit la [[Note orfane]]
- [ ] Rezolvat backupul — o copie a folderului, undeva în afara discului `D:`

## Decizii luate

- [[ADR 001 - Vault local markdown pe D]]
- [[ADR 002 - Structura vault fara foldere adanci]]

## Vaultul + Claude Code

Pentru că totul e markdown pe disc, Claude Code poate lucra direct în vault.

**Ce merită automatizat:**
- rezumat peste notele mele pe o temă („ce am scris despre multi-tenancy?")
- găsirea notelor orfane și propunerea de linkuri
- scrierea daily note-ului la finalul unei sesiuni de lucru
- conversia unui bug rezolvat în notă de tip Bug log

**Ce NU merită automatizat:**
- **scrierea notelor permanente.** Toată valoarea vine din reformularea cu cuvintele mele — vezi [[Feynman technique]]. O notă generată automat e o notă pe care nu am învățat-o.
- organizarea în MOC-uri: gruparea reflectă cum gândesc eu, nu o clasificare obiectivă

Granița e: automatizează **mecanica**, nu **gândirea**.

## Probleme cunoscute

- Configul `.obsidian/` a fost scris fără Obsidian instalat. Dacă un fișier are un format ușor diferit față de versiunea instalată, Obsidian îl resetează la default — se rezolvă activând manual din Settings. Nu e distructiv.
- Redenumirea notelor din afara Obsidian (ex. cu Claude Code) nu actualizează linkurile.

## Note legate

- [[00 START HERE]] · [[Dashboard]] · [[MOC Vault - cum functioneaza]]
- [[Cum scriu o nota permanenta]] · [[Graph view - ce e util]]
