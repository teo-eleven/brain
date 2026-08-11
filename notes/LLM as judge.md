---
tags: [note, ai, testare, eval]
created: 2026-08-11
type: note
status: schelet
---

# LLM as judge

> [!warning] Schelet — de completat de tine

## De ce e aici

În stack-ul QA (Varianta 1), DeepEval citește trace-ul din Langfuse, rulează metricile
**determinist + LLM-judge**, și scrie scorul înapoi ca adnotare.

Distincția care contează în practică: unele criterii se verifică cu cod (`finish_reason != length`,
număr de rânduri extrase vs așteptate), altele cer judecată (a halucinat? a răspuns la ce s-a
cerut?). Primele sunt gratuite și sigure. Celelalte costă și pot greși.

## De răspuns

- Când merită judge și când e doar un `assert` deghizat care costă bani?
- Cine judecă judecătorul? Cum știi că modelul-judge nu greșește sistematic?
- Ce model folosești ca judge — mai puternic decât cel evaluat, sau altul, sau același?
- Cum scazi nedeterminismul: temperature 0, rubrică explicită, few-shot, mai multe rulări?
- Bias-uri cunoscute: preferință pentru răspunsuri lungi, pentru propriul stil, ordinea opțiunilor

## Legat

- [[Metrici pentru agenti AI]] — care metrici cer judge
- [[Evals inainte de prompt changes]] · [[Ground truth pentru evaluare]]
- [[Cost-aware model routing]] — judge-ul e un cost recurent, nu unul unic
