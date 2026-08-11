---
tags: [note, ai]
created: 2026-08-11
type: note
status: schelet
---

# Reasoning tokens si bugetul de output

## De ce e aici

10.08, commit `5760a64`. În codul agentului de extracție era `max_tokens=16384`
hardcodat. Gemini 3 Flash consumă thinking tokens din ACELAȘI buget de output,
deci pe documente mari raționamentul mânca plafonul, iar JSON-ul ieșea tăiat la
mijloc: `finish_reason=length`, parse fail, iar eroarea era înghițită mai
departe (`or []` + `except` blanket) și raportată ca succes cu rezultat gol.

Fix aplicat:

- `max_tokens` scos din cod — default pe maximul modelului, override explicit
  prin `LLM_MAX_OUTPUT_TOKENS`;
- `LLM_REASONING_EFFORT=low` pentru task-ul de extracție (nu are nevoie de
  raționament lung, are nevoie de acuratețe pe câmpuri);
- `finish_reason` expus pe TOATE căile de retur, nu doar pe cea fericită;
- bisecție recursivă pe secțiuni când output-ul e trunchiat;
- fail loudly în loc de valoare goală.

## Ce trebuie știut

**Bugetul de output nu e doar textul vizibil.** La modelele cu reasoning,
`max_tokens` acoperă thinking + răspuns. Un plafon care părea generos pentru
JSON devine strâmt când modelul gândește 10k tokeni înainte.

**`finish_reason` e semnalul principal.** `stop` = model terminat; `length` =
tăiat, output invalid indiferent cât de bine arată începutul. Dacă
`finish_reason` nu e propagat până la stratul care decide pass/fail, nu ai cum
să distingi „gol pentru că nu era nimic" de „gol pentru că s-a rupt".

**Dimensionare:** nu ghici o cifră rotundă. Fie lași default-ul modelului, fie
măsori pe cazul cel mai mare din dataset și pui plafonul deasupra, cu
`reasoning_effort` scăzut acolo unde task-ul e mecanic.

**Bisecția** merită când documentul are structură pe secțiuni: dacă output-ul
pentru tot documentul e trunchiat, tai în două, extragi separat și reunești.
Costă mai multe apeluri, dar transformă un eșec într-un rezultat. Nu merită
când răspunsul e monolitic (un singur obiect care nu se poate compune).

## De răspuns

- Care e valoarea reală a lui `finish_reason=length` în rularea curentă — apare
  încă, sau a dispărut complet după fix?
- Cât din bugetul de output consumă thinking-ul la `reasoning_effort=low` față
  de `high`, pe același document? (măsurabil din trace)
- Bisecția pe secțiuni schimbă acuratețea, nu doar rata de succes? Un model
  care vede doar jumătate de document poate pierde context între secțiuni.
- Ce plafon de tokeni ar trebui să declanșeze un warning înainte de trunchiere,
  nu după?
- Există modele în stack unde thinking-ul NU intră în același buget? Cum se
  schimbă regula atunci?

## Legat

- [[Esecul tacut in sisteme AI]]
- [[Validarea output-ului LLM]]
- [[Context window - management]]
- [[Metrici pentru agenti AI]]
- [[LiteLLM - gateway pentru modele]]
- [[MOC Stack AI]]
