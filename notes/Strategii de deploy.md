---
tags: [devops, deploy]
created: 2026-08-06
type: permanent
---

# Strategii de deploy

## Variantele

| Strategie | Cum | Downtime | Cost | Rollback |
|---|---|---|---|---|
| **Recreate** | oprești tot, pornești nou | da | minim | redeploy vechi |
| **Rolling** | înlocuiești instanțele treptat | nu | minim | rolling invers (lent) |
| **Blue-green** | două medii identice, comuți traficul | nu | 2× infra | instant (comuți înapoi) |
| **Canary** | 5% trafic pe nou, crești treptat | nu | mic | oprești, ai afectat 5% |

## Care alegi

- **Rolling** — default-ul bun. E ce face Kubernetes implicit. Suficient pentru majoritatea proiectelor.
- **Blue-green** — când ai nevoie de rollback instant și îți permiți infra dublă temporar.
- **Canary** — când releasul e riscant și ai metrici bune pe care să decizi automat. Fără [[Observability - logs metrics traces]] canary-ul e inutil: nu poți ști dacă cei 5% au probleme.
- **Recreate** — perfect acceptabil pentru un tool intern la 3 dimineața. Nu totul are nevoie de zero downtime.

## Consecința care se uită

Rolling și canary înseamnă că **versiunea veche și cea nouă rulează simultan**. Deci:

- schema de bază de date trebuie compatibilă cu ambele → [[Migrari zero-downtime]]
- API-ul trebuie compatibil cu ambele → [[API versioning]]
- un job din coadă scris de versiunea nouă poate fi consumat de versiunea veche → format de mesaj compatibil, vezi [[Cozi si background jobs]]

Asta e partea grea. Mecanica deploy-ului o face orchestratorul; compatibilitatea o faci tu.

## Ce trebuie să existe indiferent de strategie

- **Readiness probe corect** — altfel trimiți trafic către instanțe care nu sunt pregătite. Vezi [[Health checks]].
- **Graceful shutdown** — cererile în curs se termină înainte de exit.
- **Rollback testat.** Nu „teoretic putem da rollback". Făcut o dată, cu cronometru.
- **Feature flags** pentru schimbări riscante: separi „deploy" de „activare". Deploy-ul devine plictisitor, activarea e reversibilă cu un toggle.

## Legături

- Face parte din: [[MOC DevOps si Deploy]]
- [[Migrari zero-downtime]] · [[Health checks]] · [[12 factor app]]
- [[Observability - logs metrics traces]] · [[API versioning]]
