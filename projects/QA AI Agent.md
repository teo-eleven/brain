---
tags: [project]
created: 2026-08-11
type: project
status: active
---

# QA AI Agent

> **Status:** active · **Repo:** `Econfaire/ecf_app_web-doc_extract_studio` · **Branch:** `qa/langfuse-tracing`

## Într-o propoziție

Infrastructură de evaluare automată pentru agenții AI de la ECF: trace-uri din producție,
metrici rulate peste ele, verdict la fiecare PR. Partea mea e agentul **„Extracție"** din
doc-studio; un coleg ia `checklist_assistant` din agent-hub.

## Stack — „Varianta 1" (self-hosted, aleasă)

Varianta 2 (Braintrust, SaaS) a fost respinsă: datele de client rămân la ECF. Prețul variantei
alese sunt 4 unelte de întreținut.

```
Agent ──► LiteLLM (gateway rutare model) ──► Model LLM
             │
             └─► callback nativ ──► Langfuse (prompt, răspuns, pași, cost, latență)
                                        │
                                        ▼
                          DeepEval citește trace-ul din Langfuse, rulează
                          metricile (determinist + LLM-judge), scrie scorul
                          înapoi în Langfuse ca adnotare
```

- **promptfoo** — separat, direct pe prompturi/modele (YAML), fără trace-uri de producție
- **GitHub Actions** — rulează ambele suite la PR/tag → pass / warning / fail

## Unde e codul

Proiectul stă în **două repo-uri**:

- **Agentul evaluat:** `D:\teodor.fotciuc\ecf_app_web-doc_extract_studio`
  (remote: https://github.com/Econfaire/ecf_app_web-doc_extract_studio, branch `qa/langfuse-tracing`)
- **Harness-ul de evaluare + documentația:** `D:\teodor.fotciuc\qa-ai-agent` — sub versionare din
  **11.08, ora 08:31**. Structura: `src/qaharness/`, `evals/deepeval/`, `promptfoo/`,
  `stack/langfuse/`, `docs/`. **Nu are remote — există doar local.**
- Langfuse comun ECF: instanță pe rețeaua internă — nu trebuie pornit local ca să ai trace-uri
  (adresa e în `qa-ai-agent/docs`, care nu pleacă pe GitHub-ul personal)

## Starea actuală

<!-- Actualizat: 2026-08-11 -->

Obiectivul fazei curente, stabilit de coordonator, e **validarea Variantei 1**, nu procesul
complet: configurare, dockerizare, un request către agent, apoi tradus ce se vede în trace în
metrici. Automatizarea și integrarea CI vin după.

**După ziua de 11.08, checklistul „prima zi" (§8) e practic terminat:**

| Pas                                                          | Stare                                                                       |
| ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| 1–3. Langfuse + doc-studio local, rutare LiteLLM cu callback | gata                                                                        |
| 4. Un request trace-uit end-to-end                           | gata — adaptor peste agentul real (`05f9a79`)                               |
| 5. Citit ce câmpuri există în trace                          | gata — `finish_reason`, tokeni, `is_truncated` etc. (`b1c56f6`)             |
| 6. Tabel de mapare câmp → metrică                            | gata — `docs/01-mapare-trace.md`                                            |
| 7. Primul grader determinist                                 | gata — criteriile 2 și 6 verificabile, completitudinea scrisă prin DeepEval |

Din cele **4 Primary**, Cost & latență e acoperit din trace. Rămân **Task success**,
**Prompt injection**, **Hallucination rate**.

Datasetul e escaladat în runde: documente realiste → brutale → nivelul următor construit pe ce a
rezistat. Semnalele care nu se pot verifica **nu mai raportează pass** — nu există verde fals.

## Următorii pași

- [ ]

## Decizii luate

- **Varianta 1 (self-hosted) în locul Braintrust**, pentru ca datele de client să nu iasă din ECF

## Probleme cunoscute

- Documentul de context `00-context-teo.md` are secțiunile 3–5 scrise pe documentația din
  10.08 dimineața, iar codul s-a schimbat între timp — §9 le corectează. De citit §9 întâi.
- **`qa-ai-agent` nu are remote** — harness-ul, datasetul și maparea de trace există într-un
  singur exemplar, pe disc. De pus pe un repo privat.

## Note legate

- [[MOC AI si LLM]] · [[MOC Testare]] · [[Observability - logs metrics traces]]

#azi
