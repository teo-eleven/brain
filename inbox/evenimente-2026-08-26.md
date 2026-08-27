---
tags: [evenimente]
created: 2026-08-26
type: evenimente
---

# Evenimente — 2026-08-26

> Generat din `.events/` de `scripts/collector/close-day.js`.
> Se rescrie la fiecare rulare — notele scrise de mână stau în ziua propriu-zisă.

**Stare:** generat la 11:07 · 18 commit-uri · 6 sesiuni · 2 proiecte · 2 de întreținere

Ziua: [[2026-08-26]]

## [[ADM Expert]]

**18 commit-uri** · +10259 / −989

- **09:17** `dbc4a3e` fix: rândurile de eroare din audit log devin lizibile  
  1 fișier · +47 / −15 · `fix/audit-log-culori-erori-lizibile`
- **10:17** `e10df39` feat: respinge documentele care nu sunt chiar factura, cu Claude Vision  
  6 fișiere · +462 / −31 · `feat/verificare-autenticitate-document`
- **11:29** `45c7d05` fix: verificarea de autenticitate merge prin LiteLLM, nu Anthropic direct  
  5 fișiere · +205 / −128 · `feat/verificare-autenticitate-document`
- **11:44** `7cf4dad` feat: pop-up informativ la categoria Auto, în validarea facturii  
  2 fișiere · +147 / −2 · `feat/pop-up-numar-auto-validare-factura`
- **11:56** `dbede3a` test: pop-up-ul de număr auto apare și fără domeniu ales  
  1 fișier · +14 / −0 · `feat/pop-up-numar-auto-validare-factura`
- **12:21** `2775b45` fix: avertizările de categorie se arată pe rând, nu suprapuse  
  2 fișiere · +137 / −60 · `feat/pop-up-numar-auto-validare-factura`
- **12:33** `15fb965` fix: defectele găsite la code review în verificarea de autenticitate  
  3 fișiere · +266 / −41 · `feat/verificare-autenticitate-document`
- **12:36** `e573b62` fix: marja de contrast pe rândurile de eroare, plus un test care o apără  
  2 fișiere · +75 / −6 · `fix/audit-log-culori-erori-lizibile`
- **15:37** `017378f` feat: companii dezactivabile, iar grupul de firme devine dată în bază  
  4 fișiere · +536 / −21 · `feat/editeaza-companii`
- **15:38** `1763bcc` feat: modulele își seamănă și își golesc singure datele unei companii  
  7 fișiere · +420 / −50 · `feat/editeaza-companii`
- **15:38** `0302c78` feat: administrarea companiilor din Setări — rute, drept propriu, acces tăiat  
  19 fișiere · +2219 / −88 · `feat/editeaza-companii`
- **15:39** `1ad2d49` feat(web): butonul „Editează companii" în Setări  
  9 fișiere · +1672 / −12 · `feat/editeaza-companii`
- **15:39** `c47d177` docs: planul funcționalității în repo, plus README și .env.example  
  3 fișiere · +350 / −1 · `feat/editeaza-companii`
- **15:39** `0a7015d` docs: planul e bifat complet — toți pașii terminați și verificați  
  1 fișier · +5 / −3 · `feat/editeaza-companii`
- **16:23** `bae3530` refactor(web): scoate butonul „Audit log" din pagina Setări  
  2 fișiere · +18 / −44 · `feat/editeaza-companii`
- **17:21** `fb1e6b6` fix: defectele găsite la revizuirea completă (2 HIGH backend, 1 HIGH interfață)  
  23 fișiere · +395 / −106 · `feat/editeaza-companii`
- **18:37** `bb0d241` feat: editare de companie pe rând, acțiuni doar cu iconițe, confirmări la ștergeri și modificări  
  31 fișiere · +2164 / −330 · `feat/editeaza-companii`
- **19:46** `da713fe` fix: defectele găsite la revizuirea în patru (2 HIGH, 4 MEDIUM), plus două plase noi  
  20 fișiere · +1127 / −51 · `feat/editeaza-companii`

**Sesiuni**

- **08:46** sesiune încheiată (clear) · nimic necomis
- **09:01** sesiune încheiată (clear) · nimic necomis
- **11:26** sesiune încheiată (other) · **5 fișiere necomise**  
  .env.example, apps/api/modules/budgets/config.py, apps/api/modules/budgets/doc_authenticity.py, tests/test_budgets_invoices.py, tests/test_doc_authenticity.py

## `qa-ai-agent`

**Sesiuni**

- **08:46** sesiune încheiată (clear) · **1 fișier necomise**  
  generators/make_limit_documents.py
- **12:47** sesiune încheiată (clear) · **1 fișier necomise**  
  generators/make_limit_documents.py
- **13:39** sesiune încheiată (clear) · **1 fișier necomise**  
  generators/make_limit_documents.py

## Întreținere

2 commit-uri automate (sincronizarea vaultului). Trecute separat, nu ascunse: o zi în care întreținerea **nu** a rulat trebuie să se vadă.

