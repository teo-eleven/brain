---
tags: [git, workflow]
created: 2026-08-06
type: permanent
---

# Branching strategies

## Variantele

**Trunk-based** — toată lumea comite în `main`, ramuri de viață scurtă (ore–2 zile), feature flags pentru ce nu e gata.
→ Necesită CI bun și teste. Cel mai puțin overhead. **Recomandat pentru majoritatea echipelor.**

**GitHub Flow** — `main` mereu livrabil, o ramură per feature, PR, merge, deploy.
→ Simplu, bine înțeles, potrivit pentru web cu deploy continuu. Practic trunk-based cu PR-uri.

**Git Flow** — `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`.
→ Proiectat în 2010 pentru software cu versiuni livrate (desktop, on-premise). Pentru un web app cu deploy zilnic e overhead pur. Chiar autorul a scris ulterior că e prea complicat pentru majoritatea cazurilor.

## Cum alegi

| Situație | Strategie |
|---|---|
| Web app, deploy des, echipă mică | GitHub Flow / trunk-based |
| Proiect personal | `main` + ramuri scurte |
| Versiuni suportate în paralel (v1 și v2 la clienți) | Git Flow, sau ramuri de release |
| Mobile cu review în store | ramuri de release, obligatoriu |

## Ce contează mai mult decât strategia

**Ramuri de viață scurtă.** O ramură care trăiește 3 săptămâni acumulează conflicte exponențial și devine un merge de o zi. Sub 2 zile, ideal.

Corolarul: **PR-uri mici.** Un PR de 50 de linii primește review real; unul de 2000 primește „LGTM". Dacă un feature e mare, îl împarți în pași care pot fi livrați ascunși în spatele unui flag.

## Convenții de denumire

```
feature/export-efactura
fix/timezone-facturi
refactor/extrage-serviciu-tva
hotfix/login-500
```

Prefixul face `git branch` citibil și permite reguli de CI per tip.

## Capcane

- **`develop` care rămâne în urmă de `main`** după hotfixuri — dacă folosești Git Flow, hotfixul trebuie merged în ambele. Se uită mereu.
- Ramuri moarte care nu se șterg: `git branch --merged` + curățare periodică.
- Feature flags care nu se șterg niciodată devin datorie tehnică. Pune o dată de expirare în cod.
- Protejează `main`: fără push direct, CI verde obligatoriu, minim un review.

## Legături

- Face parte din: [[MOC Git si Workflow]]
- [[Merge vs rebase]] · [[Conventional commits]]
- [[Strategii de deploy]] — feature flags separă deploy de activare
