---
tags: [adr, meta]
created: 2026-08-06
type: decision
status: accepted
---

# ADR 001 — Vault local markdown pe D:

> **Status:** accepted · **Data:** 2026-08-06 · **Proiect:** [[Second Brain]]

## Context

Am nevoie de un sistem de note pentru tot ce învăț și lucrez. Constrângeri reale:

- `C:` are 134 GB liberi, `D:` are 244 GB (local fixed disk, NTFS) — spațiul pe `C:` e mai prețios
- Vreau ca notele să fie ale mele, nu într-un serviciu care poate dispărea sau își schimbă prețul
- Vreau ca Claude Code să poată lucra direct în ele
- Nu vreau lock-in de format

## Decizia

Vaultul stă în **`D:\teodor.fotciuc\brain`**, în **fișiere markdown simple** cu frontmatter YAML, gestionat cu **Obsidian**.

Descărcările necesare merg separat în `D:\teodor.fotciuc\downloads`.

## Alternative considerate

| Alternativă | De ce nu |
|---|---|
| **Notion** | cloud, format proprietar, export prost, Claude Code nu poate lucra direct în el |
| **OneNote** | format binar, căutare slabă, fără linkuri bidirecționale |
| **Logseq** | bun, dar outliner strict (totul e bullet) — mai rigid pentru note lungi |
| **Fișiere pe `C:`** | spațiu mai prețios, și `C:` se reinstalează mai des la un Windows |
| **Doar markdown, fără Obsidian** | pierd backlinkurile, graful, quick switcher-ul — exact ce face sistemul util |

## Consecințe

**Bune:**
- fișiere text simple: pot fi citite cu orice editor, în 20 de ani
- Claude Code poate citi/scrie în vault
- configul Obsidian stă în `.obsidian/` **în** vault → se mută împreună cu notele
- fără abonament, fără cont, fără tooling de întreținut

**Rele (acceptate conștient):**
- **fără sincronizare automată** între dispozitive. Obsidian Sync costă; alternativa e un folder cloud.
- **fără backup implicit.** Un disc `D:` mort = totul pierdut. Trebuie rezolvat explicit.
- fără acces de pe telefon până nu configurez sincronizare
- binarul Obsidian ajunge oricum pe `C:` — `%LOCALAPPDATA%\Programs\Obsidian`, installerul nu întreabă. Nesemnificativ: zero date acolo.

## Decizie asociată: fără git

**2026-08-06 — vaultul NU se pune în git.** E un spațiu personal de gândire, nu un proiect software: nu am nevoie de istoric de commit-uri, branch-uri sau diff-uri pe note. Overhead fără câștig — [[KISS DRY YAGNI]] aplicat la propriul sistem.

Consecință: **istoricul se bazează pe „File recovery"** (plugin core, activ) — Obsidian păstrează snapshot-uri locale ale fiecărei note și le poți restaura din paleta de comenzi (`Ctrl+P` → *File recovery*). Acoperă cazul real („am șters un paragraf acum 2 zile"), nu cazul de versionare.

## Ce trebuie rezolvat din cauza asta

- [ ] **Backup.** Fără git, ce rămâne: o copie a folderului `brain` în OneDrive (există deja pe mașină), sau o copiere periodică pe alt disc. Un second brain fără backup e o bombă cu ceas.
- [ ] Decid dacă am nevoie de acces mobil

## Când s-ar reconsidera

- Dacă am nevoie reală de acces mobil zilnic → Obsidian Sync sau vault în OneDrive
- Dacă `D:` se dovedește nesigur → mut pe `C:` sau pe un disc dedicat
- Dacă ajung să colaborez cu cineva pe note → atunci un tool cu colaborare reală (nu Obsidian)
- Decizia „fără git" s-ar reconsidera doar dacă vaultul devine partajat cu altcineva. Cât e personal, nu.

## Legături

- [[Second Brain]] · [[ADR 002 - Structura vault fara foldere adanci]]
- [[MOC Vault - cum functioneaza]]
