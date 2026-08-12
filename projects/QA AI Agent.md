---
tags: [project]
created: 2026-08-11
type: project
status: active
---

# QA AI Agent

## Într-o propoziție

Evaluarea automată a agenților AI de la ECF: un harness care rulează cazuri de
test peste agentul real, citește trace-urile și scoate scoruri comparabile în timp.

## Cele două repo-uri

**Agentul evaluat** — `D:\teodor.fotciuc\ecf_app_web-doc_extract_studio`
Agentul „Extracție documente", branch `qa/langfuse-tracing`.
FastAPI + Celery + Redis + Postgres, Docker Compose cu 7 servicii.

**Harness-ul** — `D:\teodor.fotciuc\qa-ai-agent`
Pe `uv` (vezi [[uv - pachete Python rapid]]). CLI: `qaharness`.
Structură: `datasets/`, `evals/deepeval/`, `generators/`, `promptfoo/`,
`stack/langfuse/`, `baselines/`, `runs/`, `src/qaharness/`.

## Stack-ul — „Varianta 1", self-hosted

```
Agent → LiteLLM → Gemini 3 Flash
          ↓ callback
       Langfuse (trace)
          ↓ citește
       DeepEval → scrie scorul înapoi pe trace

promptfoo — separat, pe prompturi
GitHub Actions — harness.yml + promptfoo.yml, la PR și la tag
```

Componente: [[LiteLLM - gateway pentru modele]],
[[Langfuse - tracing pentru LLM]], [[DeepEval - evaluare automata]],
[[promptfoo - teste pe prompturi]].

**De ce self-hosted și nu SaaS:** datele de client rămân la firmă. A fost
criteriul decisiv, nu costul.

## Starea actuală

- Checklistul „prima zi" — terminat.
- 9 documente reale trecute prin agentul real: 6 pass / 3 warn.
- 25 de cazuri offline care verifică graderii (testează harness-ul, nu modelul).

Din cele 4 metrici Primary (vezi [[Metrici pentru agenti AI]]):

| Metrică            | Stare                                                            |
| ------------------ | ---------------------------------------------------------------- |
| Cost & latență     | acoperit, se citește din trace                                   |
| Task success       | în lucru — agregare corectă în `metrics.py` (12.08)              |
| Prompt injection   | grader existent — [[Prompt injection - aparare]]                 |
| Hallucination rate | cere golden pe toate cazurile — [[Ground truth pentru evaluare]] |

**Agregarea metricilor a fost greșită până pe 12.08:** raportul număra gradări,
nu cazuri, fiindcă doi graderi raportează pe aceeași metrică. `metrics.py` dă
acum o valoare, un prag și un verdict per metrică, cu `n/a` distinct de `ok`
pentru metricile pe care suita nu le-a exercitat.

## Probleme cunoscute

**Fără remote git — decizie, nu scăpare.** Harness-ul există doar local. E ales
deliberat: repo-ul conține detalii din proiecte de serviciu. Riscul rămâne real
(un incident pe laptop = pierdere totală) și e **asumat**, nu de rezolvat prin
publicare. Aceeași regulă ca la vault — vezi [[MOC Vault]].

Riscul e cu atât mai mare cu cât munca stă necomisă zile la rând: pe 12.08 erau
**38 de fișiere** doar în working tree. Un commit local costă nimic și acoperă
partea evitabilă a riscului.

**Separatorul ambiguu — rezolvat: era promptul.** `1.750 to` → 1750, 6/6
cantități citite de 1000× mai mare, reproductibil în 4 rulări. Părea limită de
model exact fiindcă era reproductibil. Experimentul
(`experiments/separator_ambiguu.py`, commit `d141dfd`) a arătat că se repară din
prompt.

Lecția, mai valoroasă decât defectul: **reproductibilitatea dovedește că _există_
o cauză, nu _care_ e cauza** — [[Experiment inainte de concluzie]].

Dacă reapare la alt format, plasa rămâne aceeași: **validare deterministă după
extracție** ([[Validarea output-ului LLM]]). Metoda: [[Debugging un prompt]].

## Rutina

Zilnic: [[Fluxul zilnic de evaluare]].
Trace-uri: [[Cum citesc un trace]].
Prompturi: [[Versionarea prompturilor]] și [[Evals inainte de prompt changes]].

## Următorii pași

- [ ] **Comis lucrul din working tree** — 38 de fișiere, două zile la rând
- [x] ~~Decizie pe separatorul ambiguu~~ — e promptul (`d141dfd`, 11.08)
- [x] ~~Remote git pentru harness~~ — rămâne local, deliberat
- [ ] Task success — agregarea e scrisă, rămâne rulată și verificată pe suită
- [ ] Publicat dataset-ul în Langfuse (`tools/langfuse_dataset.py`, încă doar `--dry-run`)
- [ ] Ground truth pentru cele 9 documente reale
- [ ] Prag de regresie în CI

Legături: [[MOC Stack AI]], [[MOC AI Engineer]], [[MOC Operatii zilnice]], [[MOC Studiu]]
