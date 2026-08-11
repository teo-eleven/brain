---
tags: [note, ai, unelte]
created: 2026-08-11
type: note
status: schelet
---

# LiteLLM - gateway pentru modele

## Ce e

Un strat de traducere care expune un singur API (formatul OpenAI
`chat/completions`) peste zeci de furnizori: OpenAI, Anthropic, Gemini, Bedrock,
Azure, modele locale. Schimbi furnizorul schimbând string-ul de model, nu codul.

Vine în două forme, și confuzia dintre ele costă timp:

- **bibliotecă** — `import litellm; litellm.completion(...)` rulează în procesul
  aplicației tale. Config-ul e al tău, callback-urile sunt ale tale.
- **proxy** — un server separat (`litellm --config config.yaml`) pe care îl
  cheamă mai multe aplicații. Aici stau cheile, rate limit-urile, routing-ul,
  bugetele per echipă.

Ce mai face, dincolo de traducere:

- **callback-uri native** — `litellm.success_callback = ["langfuse"]` trimite
  fiecare apel în Langfuse fără să scrii tu instrumentare.
- **parametri normalizați** — `reasoning_effort`, `max_tokens`, `temperature`
  trec prin el și sunt mapate pe ce înțelege fiecare furnizor.
- **`drop_params`** — când modelul țintă respinge un parametru, LiteLLM îl poate
  arunca tăcut în loc să crape. Util în producție, periculos în debugging: crezi
  că ai trimis `reasoning_effort=low` și de fapt a fost eliminat pe drum.
- fallback-uri și retry între modele, când unul dă 429 sau 5xx.

## Unde apare la mine

În fluxul de la ECF: `Agent → LiteLLM → Gemini 3 Flash`. Agentul de extracție
documente nu vorbește direct cu Google, ci trece prin gateway.

Detaliul important: proxy-ul LiteLLM de la ECF e **extern și partajat** între mai
multe aplicații. N-am putut activa callback-ul lui către Langfuse — ar fi
însemnat să bag trace-urile tuturor echipelor în proiectul meu, sau invers, și
oricum nu era config-ul meu de modificat. Așa că am instrumentat **aplicația**,
nu gateway-ul: span-uri din `ecf_app_web-doc_extract_studio`, cu drop-in-ul
`langfuse.openai` și un span părinte propriu.

Tot prin LiteLLM a trecut și fix-ul de la bug-ul cu output-ul tăiat:
`LLM_REASONING_EFFORT=low` ca variabilă de mediu, mapată pe `reasoning_effort`.

## Comenzi

```bash
# proxy local, pentru test
litellm --config config.yaml --port 4000

# apel prin proxy (arată exact ca OpenAI)
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{"model":"gemini-3-flash","messages":[{"role":"user","content":"ping"}]}'
```

```python
import litellm
litellm.success_callback = ["langfuse"]
litellm.drop_params = False   # vreau să crape, nu să tacă
```

## De răspuns

- Dacă proxy-ul ECF ar activa mâine callback-ul Langfuse, instrumentarea mea din
  aplicație devine redundantă sau rămâne utilă pentru context de business?
- `drop_params` e pornit pe proxy-ul partajat? Cum verific, dacă nu am acces la
  config-ul lui?
- Merită să pun un LiteLLM ca bibliotecă în `qa-ai-agent`, ca să pot ține
  callback-uri proprii în evaluare, separat de producție?
- Ce se întâmplă cu bugetul de tokens raportat de Langfuse dacă proxy-ul face
  fallback pe alt model la mijlocul unui run?

## Cum învăț asta

**Documentație:** https://docs.litellm.ai

**Primul pas practic** (30 de minute):

1. `uv add litellm` și exportă `GEMINI_API_KEY=...` în shell.
2. Rulează `python -c "import litellm; print(litellm.completion(model='gemini/gemini-2.0-flash', messages=[{'role':'user','content':'ping'}]).choices[0].message.content)"`.
3. Schimbă doar string-ul de model în `openai/gpt-4o-mini` (cu `OPENAI_API_KEY` setat) și rulează identic — același cod, alt furnizor.

**Ordinea în care merită citit:**

| Etapă | Ce                             | De ce în ordinea asta                                          |
| ----- | ------------------------------ | -------------------------------------------------------------- |
| 1     | `completion()` ca bibliotecă   | Vezi traducerea de API pe pielea ta, fără infrastructură       |
| 2     | Callbacks (`success_callback`) | Observabilitatea vine gratis, dar doar dacă știi unde se agață |
| 3     | Proxy + `config.yaml`          | Chei, routing, bugete — abia au sens după ce înțelegi apelul   |

**Capcana de începător:** lași `drop_params=True` (implicit pe proxy) și trimiți `reasoning_effort` unui model care nu-l suportă — parametrul e aruncat tăcut, apelul reușește, iar tu depanezi ore un comportament pe care crezi că l-ai configurat.

## Legat

- [[Langfuse - tracing pentru LLM]]
- [[Reasoning tokens si bugetul de output]]
- [[Cost-aware model routing]]
- [[Tracing LLM - spans si context]]
- [[MOC Stack AI]]
