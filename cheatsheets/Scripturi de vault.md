---
tags: [cheatsheet, meta]
created: 2026-08-11
type: cheatsheet
---

# Scripturi de vault

Uneltele din `scripts/`. Toate rulează **fără să deranjeze Obsidian pornit**, cu o singură
excepție notată mai jos.

## Ce se poate atinge cu Obsidian deschis

| Ce                  | Se poate? | De ce                                                                |
| ------------------- | --------- | -------------------------------------------------------------------- |
| Note `.md`          | **da**    | Obsidian detectează modificarea și reîncarcă singur                  |
| `scripts/`, `.git/` | **da**    | nu-l interesează                                                     |
| `.obsidian/*.json`  | **nu**    | ține configul în memorie și îl rescrie la ieșire, suprascriind orice |

Deci: notele se pot genera oricând, în timp ce lucrezi. Configul de graf are nevoie de
`Ctrl+Q` — **butonul X nu ajunge**, lasă procesul în tray și configul tot se rescrie.

---

## `vault-check.js` — integritatea vaultului

```bash
node scripts/vault-check.js            # raport complet
node scripts/vault-check.js --quiet    # doar verdictul
node scripts/vault-check.js --json     # pentru procesare automată
```

Raportează: linkuri moarte, note orfane, note fără backlinks, schelete necompletate, top hub-uri,
distribuție pe foldere. Iese cu cod `1` dacă găsește linkuri moarte, deci se poate lega într-un hook.

**Ce știe corect, spre deosebire de un grep naiv:** ignoră linkurile din blocuri de cod, din
code span-uri și din comentarii HTML. Un `[[Nota]]` scris ca exemplu într-un cheatsheet **nu** e
un link mort — Obsidian nici măcar nu-l parsează.

## `graph-view.ps1` — vederile de graf

```powershell
.\scripts\graph-view.ps1 -Show                  # ce config e acum
.\scripts\graph-view.ps1 -View cunostinte       # aplica (Obsidian trebuie inchis)
.\scripts\graph-view.ps1 -View jurnal -Wait     # asteapta inchiderea si aplica atunci
```

Patru vederi: `tot`, `jurnal`, `cunostinte`, `proiecte`. Culorile rămân aceleași; se schimbă doar
ce e filtrat. Detaliile despre fiecare, în [[Graph view - vederi]].

Dacă Obsidian rulează și nu dai `-Wait`, scriptul **refuză să scrie** și îți afișează filtrul de
lipit manual în lupă — mai rapid decât să închizi aplicația.

Face backup la `graph.json.bak` înainte de fiecare scriere.

## `sync-daily.ps1` — nota zilei

```powershell
.\scripts\sync-daily.ps1                   # ziua curenta
.\scripts\sync-daily.ps1 -Date 2026-08-10  # o zi anume, retroactiv
.\scripts\sync-daily.ps1 -NoTag            # fara sa umble la tagurile #azi
.\scripts\sync-daily.ps1 -Backfill         # doar legaturile, pe toate zilele
```

Scrie commit-urile zilei în `daily/AAAA-LL-ZZ.md`, între markerii `COMMITS:START/END` — restul
notei rămâne al tău. Mută `#azi-focus` pe ziua curentă și `#azi` pe proiectele atinse.
Regenerează `Azi.canvas`.

### Blocul `ATINS:START/END` — ziua ca hub

Al doilea bloc generat, sub cel de commit-uri: **legături `[[...]]` către notele din vault atinse
în ziua aia**, grupate pe folder. Sursa e istoricul git *al vaultului* — nu al repo-urilor
urmărite, alea intră în blocul de commit-uri.

De ce linkuri scrise și nu o interogare Dataview: **Dataview nu produce muchii în graph view**.
Un hub construit din query arată gol în graf. Vezi [[Graph view - vederi]].

Efectul: zilele devin coloana vertebrală a grafului, nu noduri care atârnă. Tagurile `#azi` rămân
ce erau — marcaj **efemer**, doar pentru ziua curentă; `Set-TodayTag` le șterge din tot vaultul la
fiecare rulare, deci ele nu pot ține minte trecutul. Blocul ăsta îl ține.

Două particularități, ambele deliberate:

- **Zilele fără nicio atingere în vault se sar** — nu primesc bloc gol. `2026-08-13` e așa: munca
  ei a fost în `qa-ai-agent`, deci apare în blocul de commit-uri, nu aici.
- **`2026-08-11` se numără doar de după commit-ul de rebuild** (`$RESET_COMMIT`). Înainte de el e
  resetul vaultului: ~170 de fișiere atinse, majoritatea șterse între timp. Zgomot, nu muncă.

`-Backfill` reface blocul pe toate zilele existente și **nu face commit** — te uiți la `git diff`
și decizi tu. E idempotent: a doua rulare nu schimbă nimic.

Rulează **automat la fiecare `git commit`**, dintr-un hook `PostToolUse` din
`~/.claude/settings.json`. Repo-urile urmărite sunt în `$TRACKED`, la începutul scriptului —
acolo se adaugă un proiect nou.

---

## Capcane PowerShell, plătite deja

- **`$PSScriptRoot` e gol în blocul `param()`** când scriptul e pornit cu `powershell -File`
  (merge doar cu `& script.ps1`). Fallback: `$MyInvocation.MyCommand.Path`, calculat **după**
  `param()` — care trebuie să rămână prima instrucțiune.
- **`$OutputEncoding` nu e suficient.** El spune cum _trimiți_ text către procese; pentru cum
  _citești_ înapoi ai nevoie de `[Console]::OutputEncoding`. Fără el, diacriticele din mesajele
  de commit ies `tranzi╚¢ii`.
- **Un array de un element se despachetează la `return`** — `.Count` dă `$null`. Pui `@(...)`
  la apelant.

## Legat

- [[MOC Vault]] · [[Graph view - vederi]]
