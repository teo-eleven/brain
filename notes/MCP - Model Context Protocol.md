---
tags: [note, ai, unelte]
created: 2026-08-11
type: note
status: schelet
---

# MCP — Model Context Protocol

> [!warning] Schelet — completează-l când îl folosești în profunzime

## Ce e

Protocol standard prin care un model primește acces la **unelte**, **resurse** și **prompturi**
dintr-un sistem extern. Un server MCP expune capabilități; un client (Claude Code, Claude
desktop, o aplicație proprie) le consumă.

Ideea: în loc să scrii un adaptor per aplicație, expui o dată un server MCP și îl folosește
orice client care vorbește protocolul.

## Unde apare la tine

- `fastmcp>=2.0` în `backend/requirements.txt` la doc-extract-studio
- Agentul de extracție are trei moduri de execuție, iar unul e **MCP direct, fără AI**
- Conectorii din Claude Code (Microsoft 365, GitHub, Context7) sunt tot MCP

## De răspuns

- Tool vs resource vs prompt — ce e fiecare și când alegi care?
- stdio vs HTTP streamabil: ce schimbă în deploy?
- „MCP direct, fără AI" — de ce e valoros un mod care ocolește modelul complet?
- Cum validezi ce trimite modelul către unelte? Vezi [[Validarea output-ului LLM]]
- Ce nu trebuie expus niciodată printr-un server MCP?

## Legat

- [[Tool use - function calling]] — MCP e standardizarea acestei idei
- [[Lucrul cu agenti in terminal]] · [[MOC Stack AI - unelte]]
- [[Validarea output-ului LLM]] · [[MOC Securitate]]
