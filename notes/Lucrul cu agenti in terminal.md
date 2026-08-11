---
tags: [note, ai, workflow]
created: 2026-08-11
type: note
status: schelet
---

# Lucrul cu agenți în terminal

> [!warning] Schelet — scrie aici ce înveți din practică, e nota care se schimbă cel mai des

## De ce e aici

E nodul care leagă **codul** de **agenți**: cum lucrezi zilnic cu Claude Code peste repo-urile
tale, ce merge și ce nu.

## Ce s-a dovedit, din practică

**Contextele se separă pe scop.** O sesiune de vault/graf nu scrie cod; o sesiune de
implementare nu întreține note. Amestecul le strică pe amândouă.

**Regulile trăiesc în fișiere, nu în conversație.** `CLAUDE.md` + `rules/` se încarcă la fiecare
sesiune. Ce spui în chat se pierde la următoarea.

**Ce trebuie să se întâmple automat are nevoie de hook, nu de promisiune.** Un `PostToolUse` pe
`Bash|PowerShell` care detectează `git commit` sincronizează nota zilei fără să depindă de memoria
agentului. Vezi [[Sincronizare vault cu commit-urile git]].

**Verifică ce ți se raportează.** Un scan cu regex peste `[[...]]` nu e un parser Obsidian; un
script care merge când îl rulezi tu poate cădea când îl rulează altcineva (`powershell -File` vs
`& script.ps1`).

## De răspuns

- Când merită un subagent și când e doar cost în plus?
- Ce pui în `CLAUDE.md` și ce în `rules/`? (context permanent vs detaliu la cerere)
- Cum ceri o verificare pe care s-o poți controla, nu doar un „am făcut"?
- Ce nu delegi niciodată unui agent?
- Hook-uri: care merită și care devin zgomot?

## Legat

- [[MCP - Model Context Protocol]] — cum capătă agentul acces la unelte
- [[Sincronizare vault cu commit-urile git]] · [[Second Brain]]
- [[Esecul tacut in sisteme AI]] — și un agent poate raporta succes fără să fi reușit
- [[MOC Stack AI - unelte]] · [[MOC Git si Workflow]]
