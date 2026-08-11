---
tags: [note, ai, unelte]
created: 2026-08-11
type: note
status: schelet
---

# Langfuse - tracing pentru LLM

## Ce e

Observabilitate pentru aplicații LLM. Nu e logging, e tracing: reține structura
arborescentă a unei execuții, nu linii izolate.

Ierarhia, în ordinea în care contează:

- **trace** — o execuție completă, de la intrarea utilizatorului până la răspuns.
  Are `user_id`, `session_id`, `tags`, metadata.
- **span** — o bucată de lucru din trace: parsarea PDF-ului, o secțiune, un
  retry. Se pot imbrica.
- **generation** — span specializat pentru un apel de model: prompt, răspuns,
  model, tokens (input / output / reasoning), cost, latență.
- **score** — o adnotare atașată unui trace sau unei observații. Poate veni de la
  om, de la un judge LLM sau de la un harness automat. **Aici scrie DeepEval.**

Self-hosted înseamnă că prompturile, documentele și răspunsurile nu pleacă din
firmă — singurul mod acceptabil când trace-urile conțin documente de client.

## Unde apare la mine

Instanța comună ECF, self-hosted, în `qa-ai-agent/stack/langfuse/`. Șase
containere: web, worker, postgres, clickhouse, redis, minio. ClickHouse ține
observațiile, MinIO ține payload-urile mari.

`model_prices.json` a trebuit configurat **manual** — Gemini 3 Flash nu era în
tabela implicită, deci costul ieșea 0 pe toate trace-urile. Fără el, orice
discuție despre buget e ficțiune.

### Capcana span-ului închis

Drop-in-ul `langfuse.openai` deschide un span la `create()` și îl **închide când
`create()` se întoarce**. Tot ce apelezi după — `update_current_generation`,
`update_current_trace`, scoruri, metadata — nimerește într-un context deja
închis și e **no-op tăcut**. Nicio eroare, nicio avertizare, doar câmpuri lipsă
în UI.

Fix: un span părinte explicit, `llm_call`, deschis înainte de `create()` și
închis după ce am terminat de atașat tot ce vreau.

## Comenzi

```python
from langfuse import observe, get_client

@observe(name="llm_call")           # span părinte, ține contextul deschis
def extrage_sectiune(text: str):
    resp = client.chat.completions.create(...)   # generation, copil
    get_client().update_current_span(metadata={"sectiune": "anexa_2"})
    return resp
```

```bash
docker compose -f stack/langfuse/docker-compose.yml up -d
docker compose -f stack/langfuse/docker-compose.yml ps   # toate 6 healthy?
```

## De răspuns

- Câte trace-uri pe zi produce extracția în producție și cât timp le ținem în
  ClickHouse înainte să devină o problemă de disc?
- `session_id` e setat pe documentul întreg sau pe secțiune? Ce vreau să văd ca
  unitate în UI?
- Ce se pierde dacă Langfuse pică în timpul unui run — batch-ul se reia sau
  trace-ul e pierdut definitiv?
- Scorurile scrise de DeepEval sunt separate de cele scrise manual de om, sau se
  amestecă în aceeași listă?
- `model_prices.json` cine îl actualizează când Google schimbă tariful?

## Cum învăț asta

**Documentație:** https://langfuse.com/docs

**Primul pas practic** (30 de minute):

1. `git clone https://github.com/langfuse/langfuse && cd langfuse && docker compose up -d`, apoi deschide `http://localhost:3000` și creează proiect + chei.
2. `uv add langfuse`, exportă `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` / `LANGFUSE_HOST=http://localhost:3000`.
3. Decorează o funcție cu `@observe(name="test")`, cheam-o o dată, apoi refresh în UI — trace-ul apare cu span-ul tău în arbore.

**Ordinea în care merită citit:**

| Etapă | Ce                             | De ce în ordinea asta                                    |
| ----- | ------------------------------ | -------------------------------------------------------- |
| 1     | trace / span / generation      | Fără ierarhie, UI-ul e o listă fără sens                 |
| 2     | `@observe` și contextul curent | Aici se pierd metadatele, deci aici se învață            |
| 3     | Scores și `model_prices.json`  | Evaluarea și costul au nevoie de trace-uri corecte întâi |

**Capcana de începător:** chemi `update_current_generation()` după ce `create()` s-a întors — span-ul e deja închis, apelul e no-op tăcut, iar tu cauți în UI câmpuri care n-au fost niciodată scrise.

## Legat

- [[Tracing LLM - spans si context]]
- [[Cum citesc un trace]]
- [[DeepEval - evaluare automata]]
- [[LiteLLM - gateway pentru modele]]
- [[Esecul tacut in sisteme AI]]
- [[Metrici pentru agenti AI]]
- [[MOC Stack AI]]
