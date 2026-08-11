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

| Metrică            | Stare                                            |
| ------------------ | ------------------------------------------------ |
| Cost & latență     | acoperit, se citește din trace                   |
| Task success       | de făcut                                         |
| Prompt injection   | de făcut — [[Prompt injection - aparare]]        |
| Hallucination rate | de făcut — cere [[Ground truth pentru evaluare]] |

## Probleme cunoscute

**Harness-ul nu are remote git.** Există doar local, pe disc. Un incident pe
laptop = pierdere totală. De rezolvat, nu de amânat.

**Defectul separatorului ambiguu.** 6/6 cantități în format anglo-saxon citite
de 1000× mai mare: `1.750 to` → 1750. Reproductibil în 4 rulări consecutive,
deci e defect, nu varianță.

De stabilit dacă:

- se repară din prompt → problemă de configurare;
- nu se repară → limită de model, și atunci soluția e **validare deterministă
  după extracție** ([[Validarea output-ului LLM]]).

Metoda de investigație: [[Debugging un prompt]].

## Rutina

Zilnic: [[Fluxul zilnic de evaluare]].
Trace-uri: [[Cum citesc un trace]].
Prompturi: [[Versionarea prompturilor]] și [[Evals inainte de prompt changes]].

## Următorii pași

- [ ] Remote git pentru harness
- [ ] Decizie pe separatorul ambiguu: prompt sau validator
- [ ] Task success — definiție și implementare
- [ ] Ground truth pentru cele 9 documente reale
- [ ] Prag de regresie în CI

Legături: [[MOC Stack AI]], [[MOC AI Engineer]], [[MOC Operatii zilnice]]

#azi
