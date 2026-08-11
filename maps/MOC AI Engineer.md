---
tags: [moc, ai]
created: 2026-08-11
type: moc
---

# MOC AI Engineer

Rădăcina vaultului. Tot ce ține de construit și evaluat sisteme cu LLM-uri — **construit _cu_ AI,
nu teorie despre AI**.

## Cele trei intrări

|                          |                                             |
| ------------------------ | ------------------------------------------- |
| [[MOC Stack AI]]         | uneltele concrete și cum se leagă între ele |
| [[MOC Operatii zilnice]] | ce fac efectiv într-o zi de lucru           |
| [[MOC Sedinte]]          | ce s-a decis și cu cine                     |

## Regula de aur

- [[Validarea output-ului LLM]] — **niciodată** nu tratezi output-ul ca date structurate de încredere
- [[Esecul tacut in sisteme AI]] — un sistem care minte că a reușit e mai rău decât unul care crapă

## Evaluare — cum știi că merge

- [[Metrici pentru agenti AI]] — cele 4 Primary și pragurile pe clasă de risc
- [[Ground truth pentru evaluare]] — fără adevăr de referință compari cu o părere
- [[LLM as judge]] — ce se verifică determinist și ce cere judecată
- [[Evals inainte de prompt changes]] — fără evals, orice modificare de prompt e ghicit

## Limite și costuri

- [[Context window - management]] — context mai mare ≠ răspuns mai bun
- [[Reasoning tokens si bugetul de output]] — gândirea consumă din bugetul de răspuns
- [[Cost-aware model routing]] — modelul mic întâi, escaladezi doar când trebuie

## Capabilități

- [[Tool use - function calling]] — cum dai modelului acces la sisteme
- [[MCP - Model Context Protocol]] — standardizarea aceleiași idei

## Securitate

- [[Prompt injection - aparare]] — la extracție, documentul **este** input-ul

## Observabilitate

- [[Tracing LLM - spans si context]] — ce nu ajunge în trace nu se poate măsura
- [[Cum citesc un trace]] — în ce ordine te uiți

## Proiecte

- [[QA AI Agent]] — infrastructura de evaluare, proiectul principal
- [[ADM Expert]]

## De învățat #question

- [ ] Embeddings: ce model pentru română
- [ ] Chunking strategies — cel mai subestimat detaliu din RAG
- [ ] Structured output: schemă forțată vs parsare + retry
- [ ] Fine-tuning vs RAG vs prompt engineering — arborele de decizie real
