---
tags: [note, ai, llm, cost]
created: 2026-08-11
type: note
status: schelet
---

# Reasoning tokens și bugetul de output

> [!warning] Schelet — de completat de tine

## De ce e aici

Bug real, 10.08, `5760a64`: `max_tokens=16384` era hardcodat, dar **Gemini 3 Flash cheltuie
thinking tokens din același buget**. JSON-ul ieșea tăiat la mijloc (`finish_reason=length`),
pica la parsare, iar eșecul era înghițit — vezi [[Esecul tacut in sisteme AI]].

Fixul a avut trei părți: `max_tokens` scos, default pe maximul modelului, `LLM_REASONING_EFFORT=low`
ca să limiteze gândirea, și bisecție recursivă pe secțiuni când output-ul tot iese trunchiat.

## De răspuns

- La ce modele thinking-ul consumă din bugetul de output și la care e separat? (verifică, nu presupune)
- `finish_reason` — ce valori există și care înseamnă „am pierdut date"?
- Cum dimensionezi `max_tokens` când nu știi cât de dens e documentul de intrare?
- Bisecția recursivă: când merită și când e mai ieftin să schimbi modelul?
- Ce legătură are cu [[Context window - management]] — bugetul de intrare vs cel de ieșire?

## Legat

- [[Context window - management]] · [[Cost-aware model routing]]
- [[Validarea output-ului LLM]] — output trunchiat = output invalid
- [[Esecul tacut in sisteme AI]]
