---
tags: [note, ai, testare, unelte]
created: 2026-08-11
type: note
status: schelet
---

# promptfoo — teste pe prompturi

> [!warning] Schelet — completează-l când îl folosești în profunzime

## Ce e

Testare declarativă, în YAML, direct pe prompturi și modele. **Fără trace-uri de producție** —
ăsta e firul separat de Langfuse/DeepEval.

Rulezi același prompt pe mai multe modele sau mai multe variante de prompt pe același model, și
compari rezultatele într-un tabel. Are `promptfoo-action` gata făcut pentru GitHub Actions.

## În proiectul tău

`promptfoo/promptfooconfig.yaml`, plus workflow separat: `.github/workflows/promptfoo.yml`.
Rulează la PR/tag, alături de suita harness-ului.

## De răspuns

- Când folosești promptfoo și când DeepEval? (configurație de prompt vs comportament în producție)
- Ce aserțiuni merită: `contains`, `is-json`, `llm-rubric`, cost, latență?
- Cum eviți ca suita să devină o listă de cazuri pe care prompturile deja le trec?
- Matricea prompt × model: cum o citești fără să te pierzi în ea?

## Legat

- [[Evals inainte de prompt changes]] · [[DeepEval - evaluare automata]]
- [[Cost-aware model routing]] — compararea modelelor e și o decizie de cost
- [[MOC Stack AI - unelte]]
