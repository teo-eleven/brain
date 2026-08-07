---
tags: [ai, llm, cost]
created: 2026-08-06
type: permanent
---

# Cost-aware model routing

## Ideea

Nu toate sarcinile au nevoie de cel mai capabil model. Rutează după dificultate: model mic pentru majoritatea cererilor, escaladare doar când e nevoie.

Diferența de cost între tiere e de un ordin de mărime. Într-un pipeline cu volum, asta decide dacă produsul e viabil.

## Cine face ce

| Sarcină | Model |
|---|---|
| Clasificare, rutare, extragere simplă | mic (Haiku) |
| Rezumat, reformulare, formatare | mic–mediu |
| Cod, analiză, raționament în mai mulți pași | mediu–mare (Sonnet) |
| Arhitectură, probleme ambigue, refactorizări mari | mare (Opus) |

## Pattern-ul de escaladare

```python
def raspunde(intrebare: str):
    r = model_mic(intrebare)
    if r.confidence < PRAG or not valid(r):
        r = model_mare(intrebare)          # escaladare
    return r
```

Cheia e să ai un **semnal de escaladare** de încredere:
- validare de schemă eșuată — vezi [[Validarea output-ului LLM]]
- modelul mic răspunde explicit „nu sunt sigur" (îi ceri asta în prompt)
- un clasificator ieftin decide complexitatea în prealabil
- verificare deterministă a rezultatului (compilează? testele trec? suma se potrivește?)

Ultimul e cel mai bun când există: nu ghicești încrederea, o măsori.

## Alte reduceri, în ordinea raportului efort/câștig

1. **[[Prompt caching]]** — cea mai mare reducere pentru cel mai mic efort
2. **Prompt mai scurt** — tokenii de intrare se plătesc la fiecare cerere; instrucțiunile redundante costă la infinit
3. **Batch API** — pentru munca ne-urgentă, reducere substanțială
4. **Cache clasic de răspunsuri** — întrebări identice, aceleași răspunsuri, zero apeluri. Vezi [[Cache - strategii si invalidare]].
5. **Limitează `max_tokens`** — și cere explicit concizie
6. **Nu trimite context inutil** — vezi [[Context window - management]]

## Ce trebuie să existe

- **Logging de cost per cerere** (tokeni in/out, model, cost estimat). Fără asta nu poți optimiza nimic — vezi [[Observability - logs metrics traces]].
- **Buget cu limită dură** per utilizator / per zi. Un bug într-o buclă de agent poate genera o factură de mii de euro într-o oră.
- **Evals** înainte să downgradezi un model, ca să știi ce calitate pierzi. Vezi [[Evals inainte de prompt changes]].

## Capcana

Optimizarea prematură de cost cu un model prea slab produce retry-uri, escaladări și rezultate proaste — care costă mai mult decât modelul bun de la început. **Măsoară calitatea, nu doar prețul pe token.**

## Legături

- Face parte din: [[MOC AI si LLM]]
- [[Prompt caching]] · [[Context window - management]]
- [[Evals inainte de prompt changes]] · [[Validarea output-ului LLM]]
