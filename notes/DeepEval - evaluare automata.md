---
tags: [note, ai, unelte]
created: 2026-08-11
type: note
status: schelet
---

# DeepEval - evaluare automata

## Ce e

Framework de evaluare pentru LLM cu API în stil pytest. Scrii cazuri de test,
atașezi metrici, rulezi, primești scoruri și un pass/fail.

Două familii de metrici, cu costuri complet diferite:

- **deterministe** — exact match, similaritate, verificări de schemă, prezența
  unui câmp. Rapide, gratuite, reproductibile. Prima alegere.
- **LLM-as-judge** — un model evaluează răspunsul altui model: relevanță,
  fidelitate față de sursă, halucinație. Scumpe, cu varianță, dar prind ce
  regexul nu prinde.

Ce **nu** e: DeepEval nu înlocuiește Langfuse. Langfuse observă ce s-a întâmplat
în producție; DeepEval judecă. În setup-ul meu, DeepEval **citește trace-ul din
Langfuse**, calculează metricile și **scrie scorul înapoi ca adnotare** pe același
trace. Bucla se închide în Langfuse, nu într-un raport separat.

## Unde apare la mine

`qa-ai-agent/evals/deepeval/`, cu patru fișiere care fac exact ce spune numele:

- `metrics.py` — definițiile metricilor pentru extracție documente.
- `score_job.py` — jobul care ia un run, aplică metricile, publică scorurile.
- `langfuse_client.py` — citirea trace-urilor și scrierea adnotărilor.
- `judge_model.py` — configurația modelului-judecător, ținut separat de modelul
  evaluat.

Ground truth-ul stă în `datasets/`, baseline-urile în `baselines/`, rezultatele
brute în `runs/`. GitHub Actions rulează evaluarea la PR și la tag.

Modelul-judecător trebuie să fie **altul** decât cel evaluat, altfel își notează
singur temele.

## Comenzi

```bash
uv run deepeval test run evals/deepeval/          # rulare locală
uv run python -m evals.deepeval.score_job --run-id <id>   # scor pe un run
uv run deepeval test run evals/deepeval/ -n 4     # paralel
```

## De răspuns

- Care metrici din `metrics.py` sunt deterministe și care cheamă judge-ul? Cât
  costă un run complet, în tokens?
- Un scor sub prag oprește PR-ul sau doar avertizează? Unde e pragul definit?
- Cum tratez cazurile unde ground truth-ul e ambiguu — le scot din dataset sau
  le marchez ca „acceptă mai multe variante"?
- Dacă judge-ul își schimbă versiunea, baseline-urile vechi mai sunt comparabile?
- Scorurile scrise înapoi în Langfuse sunt legate de commit-ul care le-a produs?

## De reținut

Regula de ordine: dacă o metrică poate fi scrisă determinist, **nu** o dai pe
mâna unui judge. Judge-ul e pentru ce e ireductibil subiectiv.

## Legat

- [[Langfuse - tracing pentru LLM]]
- [[LLM as judge]]
- [[Ground truth pentru evaluare]]
- [[Metrici pentru agenti AI]]
- [[Evals inainte de prompt changes]]
- [[Fluxul zilnic de evaluare]]
- [[promptfoo - teste pe prompturi]]
- [[QA AI Agent]]
- [[MOC AI Engineer]]
