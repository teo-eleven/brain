---
tags: [moc, ai, llm]
created: 2026-08-06
type: moc
---

# MOC AI si LLM

Parte din [[MOC Programare]]. Construit _cu_ AI, nu despre teoria AI.

> [[MOC Stack AI - unelte]] — uneltele concrete și cum se leagă între ele (cu diagramă)

## Regula de aur

- [[Validarea output-ului LLM]] — **niciodată** nu tratezi output-ul ca date structurate de încredere
- [[Esecul tacut in sisteme AI]] — un sistem care minte că a reușit e mai rău decât unul care crapă

## Cost și performanță

- [[Prompt caching]] — reducerea cea mai ieftină de cost
- [[Cost-aware model routing]] — modelul mic întâi, escaladezi doar când trebuie
- [[Context window - management]] — context mai mare ≠ răspuns mai bun
- [[Reasoning tokens si bugetul de output]] — gândirea consumă din bugetul de răspuns

## Capabilități

- [[Tool use - function calling]] — cum dai LLM-ului acces la sisteme
- [[RAG - pipeline]] — și de ce partea grea e retrieval, nu generarea

## Calitate — evaluarea agenților

- [[Evals inainte de prompt changes]] — fără evals, orice modificare de prompt e ghicit
- [[Metrici pentru agenti AI]] — cele 4 Primary și pragurile pe clasă de risc
- [[Ground truth pentru evaluare]] — fără adevăr de referință, compari cu o părere
- [[LLM as judge]] — ce se verifică determinist și ce cere judecată
- [[Tracing LLM - spans si context]] — ce nu ajunge în trace nu se poate măsura

## Securitate

- [[Prompt injection - aparare]] — la extracție, documentul **este** input-ul

## Legat

- [[MOC Securitate]] — prompt injection
- [[Second Brain]] — vaultul ăsta + Claude Code
- [[MOC Testare]] — evals sunt teste, cu toleranță la nedeterminism

## De învățat #question

- [ ] Embeddings: ce dimensiune / model pentru română
- [ ] Chunking strategies pentru RAG — cel mai subestimat detaliu
- [ ] Structured output: schema forțată vs parsare + retry
- [ ] Agent loops: unde se blochează și cum limitezi costul
- [ ] Fine-tuning vs RAG vs prompt engineering — arborele de decizie real
