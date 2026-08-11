---
tags: [moc, ai, unelte]
created: 2026-08-11
type: moc
---

# MOC Stack AI

Parte din [[MOC AI Engineer]]. Uneltele pe care le folosesc **efectiv**, extrase din
`qa-ai-agent` și `ecf_app_web-doc_extract_studio` — nu ce e la modă.

## Cum se leagă

```mermaid
graph LR
    A[Agent<br/>doc-extract-studio] -->|request| B[LiteLLM<br/>gateway]
    B -->|rutare| C[Model LLM<br/>Gemini 3 Flash]
    B -.->|callback nativ| D[(Langfuse<br/>trace)]
    A -.->|span-uri manuale| D
    D -->|citeste trace| E[DeepEval<br/>metrici]
    E -->|scor ca adnotare| D
    F[promptfoo] -->|direct pe prompturi| C
    G[GitHub Actions] -->|la PR/tag| E
    G -->|la PR/tag| F

    style D fill:#1e293b,stroke:#a78bfa,color:#e2e8f0
    style E fill:#1e293b,stroke:#35e07a,color:#e2e8f0
    style B fill:#1e293b,stroke:#f5a524,color:#e2e8f0
```

**Cheia:** Langfuse e sursa de adevăr. DeepEval nu o înlocuiește — citește trace-ul, notează,
scrie scorul înapoi ca adnotare. promptfoo e pe alt fir: prompturi și modele direct, fără
trace-uri de producție.

## Lanțul de LLM

- [[LiteLLM - gateway pentru modele]] — un singur API peste toți furnizorii
- [[Langfuse - tracing pentru LLM]] — unde ajung prompturile, costurile, pașii
- [[DeepEval - evaluare automata]] — metricile care produc verdictul
- [[promptfoo - teste pe prompturi]] — YAML peste prompturi, fără infrastructură
- [[MCP - Model Context Protocol]] — acces la unelte reale

## Aplicația evaluată

```mermaid
graph TD
    W[frontend] --> API[FastAPI + uvicorn]
    API --> DB[(Postgres<br/>SQLAlchemy async)]
    API --> Q[(Redis)]
    Q --> CW[celery-worker]
    Q --> CB[celery-beat]
    CW --> LLM[extractie prin LiteLLM]
    M[migrate<br/>Alembic] --> DB

    style API fill:#1e293b,stroke:#22d3ee,color:#e2e8f0
    style CW fill:#1e293b,stroke:#f5a524,color:#e2e8f0
```

- [[FastAPI - API async]] · [[Pydantic v2 - validare la boundary]]
- [[Celery si Redis - joburi asincrone]] · [[Alembic - migrari de schema]]
- [[Docker Compose - stack local]] — cele 7 servicii

## Python, zi cu zi

- [[uv - pachete Python rapid]] — înlocuiește pip, venv și poetry

## Legat

- [[MOC Operatii zilnice]] — ce faci cu uneltele astea
- [[QA AI Agent]] — proiectul unde se folosesc toate
