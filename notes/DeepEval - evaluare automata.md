---
tags: [note, ai, testare, unelte]
created: 2026-08-11
type: note
status: schelet
---

# DeepEval — evaluare automată

> [!warning] Schelet — completează-l când îl folosești în profunzime

## Ce e

Framework de evaluare pentru LLM, cu API în stil pytest. Rulează metrici **deterministe** (cod)
și **LLM-judge** (un model notează), peste cazuri dintr-un dataset.

În stack-ul tău **nu înlocuiește Langfuse**: exportă trace-ul de acolo, calculează scorurile și le
scrie înapoi ca adnotare. Langfuse rămâne sursa de adevăr.

## Din codul tău

`evals/deepeval/` — `metrics.py`, `score_job.py`, `langfuse_client.py`, `judge_model.py`.
Scorul de completitudine se scrie direct pe trace-ul cazului (`27a49e6`, 11.08).

## De răspuns

- Care metrici merită deterministe și care chiar cer judge? Vezi [[LLM as judge]]
- Cum scrii o metrică proprie când cele din framework nu se potrivesc?
- Pragurile: unde blochează și unde doar avertizează? Vezi [[Metrici pentru agenti AI]]
- Cum rulezi suita în CI fără să coste la fiecare commit?
- Ce faci cu un caz care pică nedeterminist — retry, mediere, sau semnal că metrica e proastă?

## Legat

- [[Metrici pentru agenti AI]] · [[LLM as judge]] · [[Ground truth pentru evaluare]]
- [[Evals inainte de prompt changes]] · [[Piramida testelor]]
- [[MOC Stack AI - unelte]]
