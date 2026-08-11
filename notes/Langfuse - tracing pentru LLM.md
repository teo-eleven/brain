---
tags: [note, ai, observability, unelte]
created: 2026-08-11
type: note
status: schelet
---

# Langfuse — tracing pentru LLM

> [!warning] Schelet — completează-l când îl folosești în profunzime

## Ce e

Observability pentru aplicații LLM: fiecare apel devine un **trace** cu prompt, răspuns, pași,
tokeni, cost și latență. Self-hosted (Docker), deci datele rămân la tine — motivul pentru care
s-a ales Varianta 1 în locul Braintrust.

Structura: `trace` → `span`-uri imbricate → `generation` pentru apelurile de model. Peste ele se
pot scrie **scoruri** (adnotări), pe care le pune DeepEval.

## Capcana pe care ai plătit-o (11.08)

Drop-in-ul `langfuse.openai` **își închide span-ul când `create()` se întoarce**. Orice
`update_current_*` de după e no-op tăcut. Detalii în [[Tracing LLM - spans si context]].

Instanța comună ECF rulează pe rețeaua internă; nu trebuie pornită local ca să ai trace-uri.
Stack local: 6 containere, în `stack/langfuse/`.

## De răspuns

- Ce pui pe span ca o metrică să fie calculabilă fără să deschizi loguri?
- `trace` vs `span` vs `generation` — când folosești fiecare?
- Cum legi un trace de un caz de test, ca să poți compara rulări?
- Preturile modelelor: de ce trebuie configurate manual (`model_prices.json`) și ce strică dacă nu?
- Sesiuni și utilizatori: cum grupezi trace-urile unei conversații?

## Legat

- [[Observability - logs metrics traces]] — nota-mamă
- [[Tracing LLM - spans si context]] · [[DeepEval - evaluare automata]]
- [[MOC Stack AI - unelte]] · [[QA AI Agent]]
