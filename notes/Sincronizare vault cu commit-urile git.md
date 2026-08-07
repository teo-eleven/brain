---
tags: [note, vault, git, workflow]
created: 2026-08-07
type: permanent
---

# Sincronizare vault cu commit-urile git

Vaultul își ia singur istoricul de lucru din repo-uri. Nu notez manual ce am commit-uit — asta e
muncă de copist, exact ce automatizez în [[ADM Expert]]. Notez **de ce**, mașina notează **ce**.

## Ce face

`scripts/sync-daily.ps1` face trei lucruri, în ordinea asta:

1. **Citește commit-urile zilei** din fiecare repo urmărit și le scrie în `daily/AAAA-LL-ZZ.md`:
   oră, hash, mesaj, branch-uri, număr de fișiere, linii adăugate și șterse, lista fișierelor.
2. **Mută tag-ul `#azi`** pe nota zilei și pe notele de proiect ale repo-urilor în care chiar am
   lucrat. Îl scoate de unde era ieri.
3. **Commit + push** la vault, ca backupul să fie la zi — vezi [[Second Brain]].

## Cum îl rulez

Dublu-click pe `scripts/sync-azi.cmd`. Sau, din terminal:

```powershell
D:\teodor.fotciuc\brain\scripts\sync-daily.ps1
D:\teodor.fotciuc\brain\scripts\sync-daily.ps1 -Date 2026-08-06   # reconstruiește o zi trecută
D:\teodor.fotciuc\brain\scripts\sync-daily.ps1 -NoPush            # doar local
```

## De ce tag și nu culoare pe dată

Culoarea din graph view se configurează în `.obsidian/graph.json`, iar Obsidian rescrie fișierul
când e deschis. Dacă evidențierea zilei ar fi un query pe dată (`path:daily/2026-08-07`), ar trebui
schimbat configul **zilnic**, cu Obsidian închis de fiecare dată — nefolosibil.

Cu `tag:#azi`, configul se scrie **o singură dată**. Ce se schimbă zilnic e tag-ul din note, adică
markdown obișnuit. Regula generală: **pune partea variabilă în conținut, nu în configurație.**

## Ce e protejat și ce nu

Blocul de commit-uri stă între markerii `<!-- COMMITS:START -->` și `<!-- COMMITS:END -->`.
Scriptul rescrie **doar** ce e între ei. Tot ce scriu eu în afara markerilor — Focus, Notes, Log,
Deschis — rămâne neatins, oricâte rulări fac.

Dacă nota zilei nu există, o creează. Dacă există fără markeri, inserează blocul înainte de
`## Deschis`.

## Cum adaug un proiect nou

În capul scriptului, lista `$TRACKED`:

```powershell
@{ Name = 'nume-repo'; Path = 'D:\cale\catre\repo'; Note = 'projects/Nota Proiect.md' }
```

`Note` e nota care primește `#azi` când lucrez acolo. Repo-urile care nu există pe disc sunt sărite
cu avertisment, nu opresc rularea.

## Capcana PowerShell care m-a costat un bug

PowerShell 5.1 **despachetează array-ul de un singur element** când îl returnezi dintr-o funcție.
Apelantul primește obiectul, nu array-ul, iar `.Count` pe el dă `$null` — nu `1`. Comparația
`$null -gt 0` e falsă, deci ramura nu se execută niciodată, tăcut.

```powershell
$c = @(Get-DayCommits ...)   # @() obligatoriu la APELANT, nu doar în funcție
if ($c.Count -gt 0) { ... }
```

A doua capcană, tot 5.1: un script `.ps1` **fără BOM** e citit ca ANSI, deci diacriticele din
literali ies `fiÈ™iere`. Scripturile cu text românesc se salvează **UTF-8 cu BOM**. Fișierele
markdown pe care le scrie scriptul rămân UTF-8 **fără** BOM, cum le vrea Obsidian.

## Legături

- [[Conventional commits]] — mesajele bune fac blocul generat lizibil fără să deschizi repo-ul
- [[Git cheatsheet]] · [[PowerShell cheatsheet]]
- [[Graph view - ce e util]] — evidențierea zilei e cazul de folosire care chiar merită
- [[Second Brain]] — proiectul din care face parte
