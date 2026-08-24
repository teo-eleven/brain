---
tags: [meta, operatii]
created: 2026-08-19
type: note
---

# Curățenie stație — verificat pe 2026-08-19

Nu am șters nimic. `~/.claude/hooks/pre-bash-guard.js` blochează ștergerile recursive
(„run it yourself in a terminal"), și la fel face clasificatorul din auto mode. Deci
comenzile sunt aici, iar fiecare are lângă ea metoda prin care am verificat-o înainte.

**Git n-a fost atins:** nicio comitere, niciun push, nicio ramură mutată, niciun remote
creat. [[COMENZI-REMOTE]] rămâne doar ca referință — l-ai scos din discuție când ai spus
să nu ne atingem de git.

Context în notele de zi: [[2026-08-19]], secțiunile despre clona duplicat și inventarul
stației. Proiectele atinse: [[ADM Expert]], [[QA AI Agent]].

---

## 1. Sigur de șters — dovedit redundant (~670 MB)

Rulează în PowerShell. Fiecare e independentă, poți opri oricând.

```powershell
Remove-Item -LiteralPath "C:\Users\teodor.fotciuc\ecf-adm-expert" -Recurse -Force
```

347 MB. `git status` curat, zero stash-uri, și toate cele **12 vârfuri de ramură locale
există în repo-ul din `D:`** — verificate unul cu unul cu `cat-file -e`. Conține și
`data\app.db` din 10 aug: bază de dezvoltare cu cifre demo fictive, cea vie e din 18 aug.

```powershell
Remove-Item -LiteralPath "C:\Users\teodor.fotciuc\ecf-adm-expert-backup-2026-08-05" -Recurse -Force
```

6 MB, cu 68 de fișiere necommitate — tot feature-ul de autentificare + multi-tenancy.
Verificat prin hash de blob: **51 sunt bit-cu-bit în istoricul din `D:`**. Celelalte 17
sunt drafturi mai vechi, comparate linie cu linie: în `D:` redenumirea firmă→companie a
intrat, `LEAVE_MS` a fost extras în `core/lib/constants`, `coprag` s-a adăugat ca a patra
companie, `_login` a devenit context manager. Nu se pierde nimic.

```powershell
Remove-Item -LiteralPath "C:\Users\teodor.fotciuc\ecf-adm-expert-BACKUP-v1-inainte-de-cerinta-7" -Recurse -Force
```

3.8 MB, snapshot fără `.git`. 175 de fișiere prezente în istoric, 4 sunt drafturi depășite
(`BugetLunar.tsx` 810 linii vs 2044 acum), 79 sunt `.pyc`. Două lucruri de știut înainte:

- `.env`-ul de acolo are `DEXT_WEBHOOK_SECRET` completat, iar cel actual îl are gol
  intenționat (rețeaua de birou blochează conexiunile primite, se folosește polling).
  Dacă secretul e încă înregistrat pe serverul Doc Studio, folderul e **singurul loc de
  pe disc unde mai există**.
- `_data-snapshot\` = baza SQLite din 4 aug + 4 upload-uri. Cea actuală e din 18 aug, cu
  9 upload-uri. Cifrele sunt fictive, semănate la pornire.

```powershell
Remove-Item -LiteralPath "C:\Users\teodor.fotciuc\admexpert.zip" -Force
```

696 KB. **Toate 260 de fișiere din arhivă există în istoricul git**, verificat cu
`git hash-object` — care aplică aceeași normalizare CRLF ca `git add`.

```powershell
Remove-Item -LiteralPath "D:\teodor.fotciuc\downloads\arhiva-adm-expert-clona-veche" -Recurse -Force
```

269 KB de patch-uri. **Toate 7 commit-uri originale există în `D:`**, verificate după
SHA-ul din linia `From` a fiecărui patch.

```powershell
Remove-Item -LiteralPath "D:\teodor.fotciuc\downloads\Obsidian-1.13.4.exe" -Force
```

312 MB — instalatorul. Obsidian e deja instalat, se redescarcă oricând.

```powershell
Remove-Item -LiteralPath "C:\Users\teodor.fotciuc\new-project" -Recurse -Force
```

155 KB. Demo „Hello from your new project" din 3 aug, cu tot cu
`server.js.backup-inainte-de-stergere`.

```powershell
Remove-Item -LiteralPath "C:\Users\teodor.fotciuc\Documents\Obsidian Vault" -Recurse -Force
```

24 KB. Vault gol rămas de la instalare, doar `Welcome.md`. Vault-ul real e `brain`.

```powershell
Remove-Item -LiteralPath "C:\Users\teodor.fotciuc\Desktop\teoAgent.md" -Force
Remove-Item -LiteralPath "C:\Users\teodor.fotciuc\.claude.json.tmp.13536.5ae81129daf8" -Force
Remove-Item -LiteralPath "C:\Users\teodor.fotciuc\.claude.json.tmp.3436.bb4ebd2769d3" -Force
```

`teoAgent.md` (32 KB) e copie veche a `qa-ai-agent\docs\00-context-teo.md` (29 KB vs
42 KB): comparat linie cu linie, cele 23 de linii care diferă sunt aceleași tabele cu altă
spațiere. Cele două `.tmp` sunt din 11 și 17 aug, `.claude.json` real e din 19 aug.

---

## 2. Decizia ta — nu pot dovedi că e de aruncat

```
D:\teodor.fotciuc\pgdata-ecf-inventory        50 MB
```

Cluster PostgreSQL 16 orfan, oprit (`postmaster.pid` din 10 aug). Nimic nu-l referă:
`ecf-inventory-management\docker-compose.yml` folosește volumul named `postgres_data`, nu
un bind mount pe folderul acesta — ca să-l mai citești ar trebui rescris compose-ul. Nu
pot spune ce date sunt înăuntru fără să pornesc un server pe el, de asta nu e la punctul 1.

---

## 3. Ce am mutat deja (necomis, git neatins)

```
people&culture\00. docs\note-teo-observatii-19-08.txt            <- Desktop\observatii.txt
ecf-adm-expert\docs\prezentare-adm-expert-v2.html                <- Desktop\ADM Expert Prezentare v2.html
ecf-adm-expert\docs\materiale-primite\modificari-minodora.docx   <- Desktop\modificari minodora.docx
```

Plus o reparație în `qa-ai-agent\generators\make_limit_documents.py`: avea hardcodată calea
de scratchpad a unei sesiuni Claude și își crea singur folderul, deci scria în afara
proiectului pe orice mașină. Acum scrie în `runs/`, care e ignorat de git.

---

## 4. Nu se atinge

`Desktop\Conturi Bucuresti Predefinite.txt` — 4 parole în clar, aceeași pe toate conturile.
Nu intră în niciun repo, nici privat. Locul lor e un manager de parole; parola refolosită
pe 4 conturi e o problemă separată.

Lucrul necommitat din `voice-chat-pizzerie` (9 fișiere) și `ecf_app_web-doc_extract_studio`
(7 fișiere) — muncă în repo-urile canonice, nu gunoi.

Cele 75 de fișiere comune între `people&culture` și `ecf-adm-expert` — schelet derivat,
documentat în `people&culture/README.md:17`. `ecf-adm-expert` e curat de conținut HR.

`claude-code-starter-kit` → `~/.claude`: 71 de fișiere identice, ăsta e efectul lui
`install.ps1`. Dar starter-kit-ul nu e repo git, deci sursa configurației tale n-are
versionare.
