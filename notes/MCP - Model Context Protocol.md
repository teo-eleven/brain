---
tags: [note, ai, unelte]
created: 2026-08-11
type: note
status: schelet
---

# MCP - Model Context Protocol

## Ce e

Un protocol standard prin care un model primește acces la unelte și date
externe. Înainte, fiecare integrare era ad-hoc; MCP definește un contract comun,
peste JSON-RPC.

Trei primitive, cu roluri distincte:

- **tools** — funcții pe care modelul le poate **apela**: citește document, caută
  în DB, trimite mail. Au schemă de input, deci se validează.
- **resources** — date pe care clientul le poate **citi**: fișiere, tabele,
  documentație. Nu au efecte secundare.
- **prompts** — șabloane de prompt expuse de server, pe care utilizatorul le
  poate invoca (în Claude Code apar ca slash commands).

Două transporturi:

- **stdio** — serverul e un proces copil, comunică pe stdin/stdout. Local, simplu,
  fără rețea, fără autentificare.
- **HTTP (Streamable HTTP / SSE)** — server de rețea, partajabil, cu auth. Aici
  apar problemele reale: cine are voie, ce scope, ce rate limit.

**Server** = expune capabilități. **Client** = le consumă (Claude Code, Claude
Desktop, aplicația ta). O aplicație poate fi ambele.

## Unde apare la mine

`fastmcp>=2.0` e în requirements-ul pentru `ecf_app_web-doc_extract_studio`.
Agentul de extracție are un mod **„MCP direct, fără AI"**: aceleași operații pe
documente, expuse ca tools, chemate determinist — fără model la mijloc. Util
pentru fixture-uri și pentru cazurile unde știi exact ce vrei și nu ai nevoie de
inferență (nici de costul ei, nici de nedeterminismul ei).

Și conectorii pe care îi folosesc zilnic în Claude Code — GitHub, Context7,
Atlassian, Microsoft 365 — sunt tot servere MCP. Aceeași primitivă, alt capăt.

## De reținut

Un tool MCP e o suprafață de atac. Descrierea unui tool ajunge în contextul
modelului, deci un server ostil poate injecta instrucțiuni prin numele sau
descrierea uneltei. Validează inputurile ca la orice API public, și tratează
output-ul unui tool ca date, nu ca instrucțiuni.

## Comenzi

```bash
claude mcp list                      # ce servere are clientul meu
claude mcp add doc-extract -- uv run python -m app.mcp_server   # stdio
npx @modelcontextprotocol/inspector  # inspector, pentru debug pe un server
```

## De răspuns

- Modul „MCP direct, fără AI" e folosit doar de mine în teste, sau îl consumă și
  altcineva? Dacă da, are nevoie de auth.
- Tools-urile expuse din agent au scheme Pydantic pe input, sau primesc dict-uri
  libere?
- Merită expus și `qa-ai-agent` ca server MCP, ca să pot cere evaluări din
  terminal fără să scriu comenzi?
- Apelurile MCP apar ca span-uri separate în Langfuse sau se pierd în trace?

## Legat

- [[Tool use - function calling]]
- [[Prompt injection - aparare]]
- [[Lucrul cu agenti in terminal]]
- [[Validarea output-ului LLM]]
- [[FastAPI - API async]]
- [[MOC Stack AI]]
