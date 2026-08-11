---
tags: [note, ai]
created: 2026-08-11
type: note
status: schelet
---

# Metrici pentru agenti AI

## De ce e aici

Setul de metrici fixat pentru agentul „Extracție documente", clasa B (acțiuni
cu aprobare umană). PRIMARY sunt fixe — nu se negociază de la rulare la rulare.

| Metrică PRIMARY    | Prag                                    | Comportament                              |
| ------------------ | --------------------------------------- | ----------------------------------------- |
| Task success       | ≥ 90%                                   | rezultatul-rege; sub prag = fail          |
| Cost & latență     | p95 ≤ 30s; cost +20% warning, +50% fail | două praguri, nu unul                     |
| Prompt injection   | 0 breșe                                 | orice breșă = fail, fără toleranță        |
| Hallucination rate | ≤ 1%                                    | date inventate care nu există în document |

Secondary, specifice extracției:

| Metrică Secondary      | Prag                                                |
| ---------------------- | --------------------------------------------------- |
| Completitudine         | ≥ 99% din câmpurile cerute                          |
| Integritatea execuției | 0 rulări degradate nedeclarate                      |
| Buget de pași          | max 8 iterații; orice depășire = fail               |
| Consistență `pass^3`   | ≥ 90% (același caz de 3 ori, trece de fiecare dată) |

## Ce trebuie știut

**Regula de fază 1:** blochează doar pragurile ABSOLUTE (injection = 0, buget
de pași, integritatea execuției). Restul se măsoară pentru baseline, nu blochează
încă. Altfel harness-ul devine roșu permanent și încetezi să-l crezi.

**Avertismentul statistic:** non-regresia de 3pp cere ~100+ cazuri. Cu 9 cazuri
în dataset, un singur caz valorează 11pp — deci orice „regresie" observată la
scara asta e zgomot, nu semnal. Până crește datasetul, diferențele mici nu se
interpretează.

**Integritatea execuției** e metrica născută din bug-urile de eșec tăcut: o
rulare degradată (model de fallback, retry, output trunchiat, span lipsă) care
nu e declarată explicit invalidează toate celelalte cifre din rularea aia.

**`pass^3`** măsoară nedeterminismul: un caz care trece 2 din 3 ori nu e un caz
care trece.

## De răspuns

- Când trec din faza 1 în faza 2 — ce condiție concretă marchează trecerea
  (număr de cazuri? număr de rulări stabile consecutiv)?
- Care e baseline-ul actual real pe fiecare PRIMARY, măsurat, nu estimat?
- Cum definesc „halucinație" operațional, ca să fie măsurabilă automat și nu
  prin citire manuală?
- Costul se compară față de ce referință — ultima rulare, o medie mobilă, sau o
  valoare fixată la baseline?
- Câte cazuri îmi trebuie ca 3pp să devină semnal, și de unde le iau fără să
  fabricat totul?

## Legat

- [[Esecul tacut in sisteme AI]]
- [[Ground truth pentru evaluare]]
- [[Prompt injection - aparare]]
- [[Cost-aware model routing]]
- [[Evals inainte de prompt changes]]
- [[DeepEval - evaluare automata]]
- [[Fluxul zilnic de evaluare]]
- [[MOC AI Engineer]]
