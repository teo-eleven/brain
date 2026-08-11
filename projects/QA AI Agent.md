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

- Local: `D:\teodor.fotciuc\ecf_app_web-doc_extract_studio`
- Documentație / context: `D:\teodor.fotciuc\qa-ai-agent\docs` (**nu e repo git** — doar fișiere)
- Langfuse comun ECF: instanță pe rețeaua internă — nu trebuie pornit local ca să ai trace-uri
  (adresa e în `qa-ai-agent/docs`, neversionat, ca să nu ajungă pe GitHub-ul personal)
- Repo remote: https://github.com/Econfaire/ecf_app_web-doc_extract_studio

## Starea actuală

<!-- Actualizat: 2026-08-11 -->

Tracing-ul Langfuse e instrumentat pe `qa/langfuse-tracing`. Obiectivul fazei curente, stabilit
de coordonator, e **validarea Variantei 1**, nu procesul complet: configurare, dockerizare, un
request către agent, apoi tradus ce se vede în trace în metrici. Automatizarea și integrarea CI
vin după.

## Următorii pași

- [ ]

## Decizii luate

- **Varianta 1 (self-hosted) în locul Braintrust**, pentru ca datele de client să nu iasă din ECF

## Probleme cunoscute

- Documentul de context `00-context-teo.md` are secțiunile 3–5 scrise pe documentația din
  10.08 dimineața, iar codul s-a schimbat între timp — §9 le corectează. De citit §9 întâi.
- `qa-ai-agent/docs` nu e versionat.

## Note legate

- [[MOC AI si LLM]] · [[MOC Testare]] · [[Observability - logs metrics traces]]
