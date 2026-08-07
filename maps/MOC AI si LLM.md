---
tags: [moc, ai, llm]
created: 2026-08-06
type: moc
---

# MOC AI si LLM

Parte din [[MOC Programare]]. Construit *cu* AI, nu despre teoria AI.

## Regula de aur

- [[Validarea output-ului LLM]] — **niciodată** nu tratezi output-ul ca date structurate de încredere

## Cost și performanță

- [[Prompt caching]] — reducerea cea mai ieftină de cost
- [[Cost-aware model routing]] — modelul mic întâi, escaladezi doar când trebuie
- [[Context window - management]] — context mai mare ≠ răspuns mai bun

## Capabilități

- [[Tool use - function calling]] — cum dai LLM-ului acces la sisteme
- [[RAG - pipeline]] — și de ce partea grea e retrieval, nu generarea

## Calitate

- [[Evals inainte de prompt changes]] — fără evals, orice modificare de prompt e ghicit

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
