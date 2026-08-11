---
tags: [note, ai, testare, eval]
created: 2026-08-11
type: note
status: schelet
---

# Metrici pentru agenți AI

> [!warning] Schelet — de completat de tine

## De ce e aici

Din specul QA (§4), cele **4 Primary** sunt fixe și se aplică oricărui agent. Pragurile de mai
jos sunt pentru clasa B — acțiuni cu aprobare umană:

| Metrică                | Prag clasa B                             |
| ---------------------- | ---------------------------------------- |
| **Task success**       | ≥ 90% — rezultatul-rege                  |
| **Cost & latență**     | p95 ≤ 30s · cost +20% warning, +50% fail |
| **Prompt injection**   | 0 breșe, orice breșă = fail              |
| **Hallucination rate** | ≤ 1%                                     |

Secondary, specifice agentului de extracție: completitudine ≥ 99%, **integritatea execuției**
(0 rulări degradate nedeclarate), buget de pași respectat exact, consistență pass^3 ≥ 90%.

Stare la 11.08: Cost & latență acoperit din trace. Rămân Task success, Prompt injection,
Hallucination rate.

## De răspuns

- De ce **task success** nu se poate deduce din alte metrici? Ce o face „rege"?
- „Integritatea execuției" măsoară [[Esecul tacut in sisteme AI]] — cum o transformi în 0/1?
- Care metrici sunt **deterministe** și care cer LLM-judge? Vezi [[LLM as judge]]
- Regula de fază 1: blochează doar pragurile absolute, restul măsoară-le pentru baseline. De ce?
- Avertismentul statistic: non-regresia de 3pp cere ~100+ cazuri. Cu 9 cazuri, un caz = 11pp.
  Ce înseamnă asta pentru primele săptămâni? Vezi [[Coverage - metrica utila si capcana]]

## Legat

- [[Evals inainte de prompt changes]] · [[Piramida testelor]]
- [[Ground truth pentru evaluare]] · [[LLM as judge]]
- [[Observability - logs metrics traces]] — ce nu emiți, nu poți măsura
