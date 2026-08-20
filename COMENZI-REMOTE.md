---
tags: [meta, operatii]
created: 2026-08-19
type: note
---

# Comenzi de rulat manual — remote + push pentru repo-urile fără backup

Stare verificată pe 2026-08-19:
- `brain` — DEJA URCAT (4 commit-uri, branch `notes/proiecte-personale-2026-08-18`)
- `qa-ai-agent` — fără remote. Urcă 263 fișiere / 1.99 MiB (restul din 842 MB e `.venv/` + `runs/`, ignorate)
- `people&culture` — fără remote. Urcă 353 fișiere / <1 MiB (datele HR reale sunt ignorate corect)

Verificat înainte: niciun `.env` în istoric, nicio cheie API, niciun `.xlsx` cu date de angajați
a existat vreodată în istoricul `people&culture`. PDF-urile din `qa-ai-agent` sunt fabricate.

## Varianta A — în organizația Econfaire (privat)

    cd D:\teodor.fotciuc\qa-ai-agent
    gh repo create Econfaire/qa-ai-agent --private --source=. --remote=origin --push

    cd "D:\teodor.fotciuc\people&culture"
    gh repo create Econfaire/people-culture --private --source=. --remote=origin --push

## Varianta B — pe contul personal tewtzu-ctrl (privat)

    cd D:\teodor.fotciuc\qa-ai-agent
    gh repo create tewtzu-ctrl/qa-ai-agent --private --source=. --remote=origin --push

    cd "D:\teodor.fotciuc\people&culture"
    gh repo create tewtzu-ctrl/people-culture --private --source=. --remote=origin --push

## De ce `people-culture` și nu `people&culture`

`&` sparge comenzile în PowerShell/cmd și trebuie encodat în URL-uri. Numele repo-ului
poate fi `people-culture` chiar dacă folderul local rămâne cum e; dacă vrei și folderul
redenumit, e pasul 4 din plan.

## Verificare după push

    git -C D:\teodor.fotciuc\qa-ai-agent log --oneline @{u}..HEAD | wc -l    # trebuie 0
    git -C "D:\teodor.fotciuc\people&culture" log --oneline @{u}..HEAD | wc -l  # trebuie 0
