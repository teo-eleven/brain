---
tags: [ai, llm, testing]
created: 2026-08-06
type: permanent
---

# Evals inainte de prompt changes

## Regula

**Fără evals, orice modificare de prompt e ghicit.** „Pare mai bine acum" nu e o măsurătoare — e confirmation bias pe 3 exemple pe care le-ai ales tu.

Prompt engineering fără evals nu e inginerie.

## Ce e un eval

Un set de cazuri de test cu rezultate așteptate, rulat automat, care produce un scor comparabil între versiuni.

```
cazuri.jsonl:
{"input": "...", "expected": {"tip": "factura", "total": 1250.50}}
{"input": "...", "expected": {"tip": "aviz", "total": null}}
```

Minimul viabil: **20-30 de cazuri** care acoperă cazul normal, cazurile limită și cele care au eșuat în trecut. Cele din trecut sunt cele mai valoroase — sunt bug-uri reale, nu imaginate.

## Cum notezi

| Metodă | Când | Note |
|---|---|---|
| **Potrivire exactă** | clasificare, extragere de câmpuri | cel mai bun când e posibil |
| **Verificare programatică** | „e JSON valid", „suma se potrivește", „codul compilează" | obiectiv, ieftin, preferabil |
| **LLM-as-judge** | rezumate, ton, calitate de text | subiectiv, are nevoie de rubrică explicită |
| **Om** | cazuri ambigue, calibrarea judecătorului | scump, nu scalează, dar necesar periodic |

Ordinea preferinței: determinist > programatic > LLM-judge > om. Folosește cel mai obiectiv care se aplică.

## Fluxul corect

1. Set de eval **înainte** de a modifica promptul
2. Rulezi, notezi scorul de bază
3. Modifici promptul
4. Rulezi din nou → compari
5. Dacă a scăzut, revii. Fără dezbatere.

## Ce prinde un eval și un test manual nu

- **Regresii.** Ai reparat cazul A și ai rupt cazul B — cel mai frecvent tip de eșec la prompturi. Cu 3 teste manuale nu-l vezi niciodată.
- **Nedeterminism.** Rulează fiecare caz de 3 ori: dacă rezultatul variază, promptul e fragil, chiar dacă „a funcționat" o dată.
- **Efectul schimbării de model.** Când vrei să downgradezi pentru cost ([[Cost-aware model routing]]), evalul îți spune exact ce pierzi.

## Capcane

- **Set de eval prea mic** (5 cazuri) → zgomot mai mare decât semnalul
- **Cazuri toate ușoare** → scor 100% care nu spune nimic
- **Optimizare pe eval** — dacă rafinezi promptul până trece perfect setul, ai supraînvățat. Ține un set de holdout la care nu te uiți.
- **Fără versionare a prompturilor.** Prompturile sunt cod: în git, cu istoric. Vezi [[Conventional commits]].

## Legături

- Face parte din: [[MOC AI si LLM]] · [[MOC Testare]]
- [[Validarea output-ului LLM]] · [[Cost-aware model routing]]
- [[RAG - pipeline]] — evaluează retrievalul separat de generarea
- [[TDD - red green refactor]] — aceeași disciplină, cu toleranță la nedeterminism
