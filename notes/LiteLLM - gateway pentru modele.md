---
tags: [note, ai, unelte]
created: 2026-08-11
type: note
status: schelet
---

# LiteLLM — gateway pentru modele

> [!warning] Schelet — completează-l când îl folosești în profunzime

## Ce e

Un strat între aplicație și furnizorii de modele: scrii o dată în formatul OpenAI, iar LiteLLM
traduce către Anthropic, Google, Azure sau ce mai apare. Poate rula ca **bibliotecă** (import în
cod) sau ca **proxy** (serviciu separat, cu chei și rutare centralizate).

Are **callback nativ către Langfuse** — se activează din config, fără cod de tracing scris de mână.

## Din experiența ta (11.08)

Callback-ul proxy-ului ECF **nu s-a putut folosi**: proxy-ul e extern și partajat, deci
trace-urile ar fi ajuns amestecate. Soluția a fost instrumentarea aplicației
(`qa/langfuse-tracing`), nu a gateway-ului.

`reasoning_effort` se trimite **prin** LiteLLM către model, cu validare și degradare când modelul
îl respinge — vezi [[Reasoning tokens si bugetul de output]].

## De răspuns

- Bibliotecă vs proxy: ce câștigi și ce pierzi cu fiecare?
- Ce se întâmplă cu parametrii pe care modelul-țintă nu-i suportă? (`dropped_params`)
- Cum faci fallback între modele când unul cade? Vezi [[Cost-aware model routing]]
- Când merită gateway și când e un strat în plus care ascunde erori?

## Legat

- [[Cost-aware model routing]] · [[Langfuse - tracing pentru LLM]]
- [[MOC Stack AI - unelte]]
