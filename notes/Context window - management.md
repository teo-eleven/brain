---
tags: [note, ai]
created: 2026-08-11
type: note
status: schelet
---

# Context window - management

## De ce e aici

La extracție, input-ul e un PDF întreg — uneori mare, cu layout, tabele,
secțiuni. Tentația e „bag tot documentul, modelul are context mare, se descurcă".
Bug-ul din 10.08 (commit `5760a64`) a arătat cealaltă față a problemei: contextul
de intrare încăpea, dar bugetul de IEȘIRE nu, pentru că thinking tokens ai lui
Gemini 3 Flash ieșeau din același plafon de 16384. Fixul a inclus bisecția
recursivă pe secțiuni — adică exact o strategie de management al contextului.

## Ce trebuie știut

**Context mai mare ≠ răspuns mai bun.** Fereastra mare spune doar cât încape, nu
cât e folosit eficient. Cu cât e mai mult text irelevant, cu atât mai multe
șanse ca modelul să atașeze valori din secțiunea greșită. La extracție asta se
vede direct în hallucination rate și în câmpuri corecte ca formă dar luate din
alt tabel.

**Două bugete separate, care se confundă ușor:**

- **intrare** — cât text trimiți (document, instrucțiuni, schemă, exemple);
- **ieșire** — cât poate genera modelul, thinking inclus la modelele cu reasoning.

Un plafon de intrare confortabil nu spune nimic despre cel de ieșire. Un
document de 40 de pagini care încape lejer la intrare poate produce un JSON care
NU încape la ieșire.

**Ce tai primul, în ordine:**

1. exemple few-shot redundante (păstrează cele care acoperă cazuri limită);
2. secțiuni din document care nu conțin niciun câmp din schemă;
3. istoricul iterațiilor anterioare din buclă (păstrezi doar ultimul eșec relevant);
4. instrucțiunile duplicate din system prompt.

**Când tăierea nu ajunge, împarți:** bisecția pe secțiuni cu recompunere la
final. Costă apeluri, dar păstrează acuratețea per bucată.

## De răspuns

- Care e distribuția reală a mărimii documentelor din dataset — de la ce prag în
  sus apare trunchierea?
- Trimit tot documentul sau doar paginile relevante? Există un pas de
  pre-filtrare și merită?
- Schema configurabilă intră în prompt la fiecare apel — cât din buget ocupă și
  se poate compacta?
- La bisecție, ce se pierde între secțiuni (referințe încrucișate, totaluri
  calculate pe tot documentul)?
- Prompt caching ar reduce costul pe partea fixă a promptului la volumul actual
  de rulări?

## Legat

- [[Reasoning tokens si bugetul de output]]
- [[Cost-aware model routing]]
- [[Validarea output-ului LLM]]
- [[Metrici pentru agenti AI]]
- [[Debugging un prompt]]
- [[MOC Stack AI]]
