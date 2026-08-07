---
tags: [ai, llm, cost, performance]
created: 2026-08-06
type: permanent
---

# Prompt caching

## Ideea

Dacă începutul promptului tău e identic între cereri, furnizorul poate refolosi calculul deja făcut pentru acea porțiune. Plătești mult mai puțin pe tokenii cache-uiți și primești răspunsul mai repede.

E cea mai ieftină optimizare de cost din lucrul cu LLM-uri: **nu schimbi nimic în logică, doar ordinea conținutului.**

## Regula: stabil la început, variabil la final

Cache-ul funcționează pe **prefix exact**. Un singur caracter diferit la începutul promptului invalidează tot ce urmează.

```
[ instrucțiuni de sistem      ]  ← stabil, se cache-uiește
[ documentație / exemple      ]  ← stabil, se cache-uiește
[ schema / few-shot examples  ]  ← stabil, se cache-uiește
────────────────────────────────
[ istoricul conversației      ]  ← crește, se poate cache-ui parțial
[ întrebarea utilizatorului   ]  ← variabil, nu se cache-uiește
```

## Ce sparge cache-ul fără să-ți dai seama

- **Un timestamp în prompt.** „Data curentă: 2026-08-06 14:32:07" → prefix diferit la fiecare secundă. Dacă chiar ai nevoie de dată, pune-o **la final**, sau folosește doar ziua.
- Un ID de sesiune, un nume de utilizator, un contor — orice variabil plasat sus.
- Reordonarea instrucțiunilor între versiuni de cod.
- Schimbarea modelului sau a parametrilor (la unii furnizori).

## Când merită

- **Chat cu istoric** — prefixul crește monoton, exact cazul ideal
- **Prompt de sistem lung** (instrucțiuni, ton, reguli de business) reutilizat pe multe cereri
- **RAG cu documente stabile** — vezi [[RAG - pipeline]]
- **Agent cu multe tool-uri** — definițiile tool-urilor sunt lungi și fixe, vezi [[Tool use - function calling]]

Nu merită pentru cereri unice, scurte, complet diferite între ele.

## Detalii de reținut

- Există un **minim de tokeni** sub care cache-ul nu se activează (ordinul miilor, variază pe furnizor și model).
- TTL-ul e scurt (minute). Un trafic rar nu beneficiază; unul constant, foarte mult.
- Scrierea în cache poate costa puțin mai mult decât un token normal, citirea costă mult mai puțin. Cu reutilizare, câștigi net imediat.
- **Măsoară.** Răspunsurile API includ numărul de tokeni citiți din cache — dacă e zero, ceva îți sparge prefixul și merită găsit.

## Legături

- Face parte din: [[MOC AI si LLM]]
- [[Cost-aware model routing]] · [[Context window - management]]
- [[Cache - strategii si invalidare]] — aceeași idee, alt strat
