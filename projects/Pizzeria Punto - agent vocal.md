---
tags: [project, personal]
created: 2026-08-18
type: project
status: active
---

# Pizzeria Punto - agent vocal

## Într-o propoziție

Agent conversațional care preia comenzi de pizza: clientul vorbește, agentul notează, validează,
confirmă, iar comanda apare live la bucătărie și la livrator.

## Unde e codul

```
github.com/tewtzu-ctrl/voice-chat-pizzerie       # privat, creat 07.08
D:\teodor.fotciuc\voice-chat-pizzerie            # copie RAMASA IN URMA, vezi mai jos
```

```
apps/agent/      agent.py, tools.py, checklist.py, cli.py, config.py, prompts/system_v1.md
apps/api/        routes_session, routes_orders, routes_menu, sessions, session_access,
                 placement, spoken, geocoding, events, db, tables
packages/domain  catalog, pricing, cart_ops, capacity, delivery_zone, order_state, money,
                 address_text, limits, enums, errors
apps/web/        index.html (client), kitchen.html, driver.html, harness.html — vanilla, fără build
data/            menu.seed.json, delivery_zone.json, kitchen.config.json, suceava.streets.json
scripts/         import_addresses.py, add_address.py, smoke_e2e.py
docs/PLAN.md     planul, cu deciziile care nu se redeschid
```

## Principiul din care decurge tot

**LLM-ul nu ține comanda în cap.** Coșul trăiește pe server; LLM-ul e interfața conversațională
peste un API de coș și primește la fiecare tur starea reală injectată în context. Backend-ul decide
ce există, cât costă, dacă se livrează la adresa asta, ce ETA are și — la plasare — **re-validează
totul de la zero**. LLM-ul decide doar ce a vrut să spună clientul, ce clarificare cere și cum
formulează răspunsul.

E [[Validarea output-ului LLM]] dusă la nivel de arhitectură, nu de funcție: modelul n-are voie să
fie sursa unui număr. Vezi și [[Tool use - function calling]].

**Starea agentului e o listă de bifat, nu o șină de tren.** Două steaguri per categorie — _am
întrebat?_ și _are ceva?_ — și întrebi doar unde ambele sunt goale. După un „nu", categoria se
închide definitiv. Un dialog nu are pași, are goluri.

Promptul stă versionat pe nume: `prompts/system_v1.md` — [[Versionarea prompturilor]].

## Fazele, așa cum au intrat în git

| Ziua           | Ce                                                                                                                                                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 07.08          | **Faza 1** — domeniu pur + API FastAPI/SQLite + trei ecrane web. 199 teste, coverage 97% (`50f5c68`)                                                                                                                                                                      |
| [[2026-08-12]] | **Faza 2** — agentul pe text: checklist, tool-uri, buclă. +1606/−1 în 10 fișiere                                                                                                                                                                                          |
| [[2026-08-13]] | **Faza 4** — șapte commit-uri, +4407/−829: ruff cu reguli de securitate și mypy strict, plafoane în modele, I/O blocant scos de pe event loop, `routes_session` spart în bucăți, zona de livrare mutată la Suceava, aplicația de comandat pas cu pas, teste pe concurență |
| [[2026-08-14]] | străzile și numerele municipiului Suceava importate din OpenStreetMap — **+33911 de linii**, aproape tot date                                                                                                                                                             |
| [[2026-08-15]] | număr de comandă care repornește de la 1 în fiecare zi; mesajele și erorile ca pop-up, cu numărul comenzii pe toate ecranele                                                                                                                                              |

Vocea încă nu e legată: pipeline-ul STT → LLM → TTS e decis (Deepgram Nova-3 pentru română,
ElevenLabs Flash v2.5, LiveKit Agents ca framework, cu SIP nativ pentru telefonie mai târziu), dar
ce rulează azi e **agentul pe text**.

Riscul #1 asumat în plan nu e modelul, e **acuratețea recunoașterii vocale pe română, pe adrese**.
De asta importul OSM al străzilor din Suceava a venit înaintea vocii: dacă adresa se verifică
determinist într-o listă reală, o transcriere greșită devine o întrebare de clarificare, nu o
livrare la adresa greșită.

## Capcană: două copii, cea de aici e moartă

`D:\teodor.fotciuc\voice-chat-pizzerie` are `HEAD` pe `50f5c68` — **Faza 1** — plus 9 fișiere
modificate pe 07.08 la 12:11 și niciodată comise. Originul are 14 commit-uri peste. Copia e un repo
git perfect valid, doar că arată proiectul cum era acum 11 zile.

Identic cu capcana de pe [[ADM Expert]] (copia de pe `C:`), și din aceeași cauză: lucrul a trecut pe
altă mașină, iar copia veche nu s-a plâns niciodată. **De comparat modificările locale înainte de
orice `git pull`** — probabil sunt deja depășite de ce s-a scris în Faza 4.

`docs/PLAN.md` mai spune, la fel de sincer și la fel de învechit: „100% local pe
`C:\Users\teodor.fotciuc\pizza-punto`, fără remote — nimic nu se încarcă nicăieri". Astăzi există
remote privat, iar codul nu mai e nici pe acea cale.

## Deschis

- [ ] **Faza vocală** — nimic din STT/TTS nu e încă în cod
- [ ] **Copia stale de pe `D:`** — de reconciliat sau de șters; cât timp stă acolo, e o a doua sursă
      de adevăr care arată Faza 1 ca stare a proiectului
- [ ] Cele 9 fișiere modificate local pe 07.08 — de decis dacă mai înseamnă ceva

## Legat

- [[Proiecte personale]] · [[Validarea output-ului LLM]] · [[Tool use - function calling]]
- [[Esecul tacut in sisteme AI]] — o copie moartă nu raportează nimic

#personal
