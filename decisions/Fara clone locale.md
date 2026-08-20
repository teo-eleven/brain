---
tags: [decision, workflow]
created: 2026-08-19
type: decision
status: adoptat
---

# Fără clone locale — un exemplar per proiect

**Decis pe 19.08.2026.** Primul ADR din vault.

## Decizia

Un singur exemplar per proiect pe stație. Copia de siguranță se face prin **push**, nu prin
duplicarea folderului. Un folder duplicat nu e backup — e a doua sursă de adevăr.

## Contextul care a produs-o

Inventarul din [[2026-08-19]] a găsit **10 repo-uri git pe stație, din care trei erau același
proiect**: [[ADM Expert]] în original pe `D:`, o clonă înghețată pe 10.08 (347 MB) și un
`-backup-2026-08-05` (6 MB, cu 68 de fișiere necomise).

Costul nu a fost discul. A fost că `$TRACKED` din `sync-daily.ps1` citea **clona moartă**, deci
**nouă zile de lucru pe ADM Expert n-au intrat în vault** între 10.08 și 19.08.

Ce face defectul ăsta greu de prins: o cale **inexistentă** ar fi dat avertismentul scriptului
(`! sar peste ... nu e repo git`). O **clonă veche** e un repo perfect valid, care raportează
sincer „zero commit-uri azi" — și are dreptate, pentru repo-ul ăla. Scriptul n-a greșit
niciodată; citea altceva decât credeam eu. [[Esecul tacut in sisteme AI]].

## Ce am verificat înainte s-o adopt

Amândouă copiile, fișier cu fișier și commit cu commit: **niciuna nu conținea ceva absent din
original.** Cele 7 commit-uri nepushuite din 04.08 erau identice în ambele (verificate și pe
`patch-id`, nu doar pe SHA), iar cele 68 de fișiere necomise din backup — auth, companii,
multi-tenancy — existau toate în `dev`, în formă finală. Metoda și dovada, pe fiecare item, în
[[CURATENIE]].

Deci regula nu e o precauție teoretică: în cazul concret, duplicarea **n-a salvat nimic** și a
costat nouă zile de jurnal.

## Ce înseamnă în practică

- Un proiect mutat se **mută**, nu se copiază — vechea locație dispare în aceeași sesiune
- „Fac o copie înainte să modific" se înlocuiește cu un branch sau un commit
- Un snapshot fără `.git` (ca `-BACKUP-v1-inainte-de-cerinta-7`) e cea mai proastă variantă:
  nu se poate compara automat cu nimic
- Corolarul, valabil și invers: un proiect care **n-are remote** nu are backup deloc, oricâte
  copii locale ar avea. Vezi [[QA AI Agent]] — 42 de commit-uri, niciun remote, decizie asumată

## Ce rămâne deschis

Copiile identificate nu sunt încă șterse: `pre-bash-guard.js` refuză ștergerile recursive și
cere să fie rulate manual. Comenzile, cu dovada lângă fiecare, sunt în [[CURATENIE]].

## Legat

- [[ADM Expert]] · [[QA AI Agent]] · [[CURATENIE]] · [[COMENZI-REMOTE]]
- [[MOC Operatii zilnice]] — rutina care s-a rupt din cauza clonei
