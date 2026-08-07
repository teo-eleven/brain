---
tags: [testing]
created: 2026-08-06
type: permanent
---

# Test doubles - mock stub fake spy

## Ideea

Patru lucruri diferite, pe care toată lumea le numește „mock". Distincția e utilă pentru că spune **ce verifică testul**.

| Tip | Ce face | Verifică |
|---|---|---|
| **Dummy** | doar umple un parametru | nimic |
| **Stub** | întoarce valori prestabilite | **starea** rezultată |
| **Spy** | înregistrează cum a fost apelat | apelurile, după fapt |
| **Mock** | așteptări setate în avans, eșuează dacă nu se respectă | **interacțiunea** |
| **Fake** | implementare reală, simplificată (DB in-memory) | starea, realist |

## Distincția care contează: stub vs mock

- **Stub** → *„presupunem că API-ul întoarce cursul 4.97. Rezultatul e corect?"* Testezi **rezultatul**.
- **Mock** → *„s-a apelat `trimite_email` exact o dată, cu adresa corectă?"* Testezi **comportamentul**.

Preferă stub-uri. Testele bazate pe mock verifică *cum* e implementat ceva, deci se sparg la fiecare refactorizare, chiar dacă comportamentul e neschimbat. Sunt exact testele care fac echipele să urască testele.

Mock-urile sunt justificate când **efectul secundar E cerința**: „la înregistrare se trimite un email de confirmare". Acolo nu există stare de verificat — apelul e comportamentul.

## Fake e adesea cea mai bună alegere

Un repository in-memory sau un Postgres în Testcontainers îți dă teste realiste fără fragilitate. Bug-uri de tipul „interogarea mea nu e SQL valid" nu apar niciodată cu un mock — apar cu un fake.

## Semne că exagerezi

- Testul are 15 linii de setup de mock-uri și 2 de assert
- Trebuie să mock-uiești 6 dependențe pentru un test → clasa face prea multe, vezi [[Cuplare si coeziune]]
- Mock-uiești ceva ce tu deții → probabil ai nevoie de un fake sau de un obiect real
- Testul trece, dar codul e rupt în producție → ai mock-uit exact partea care era greșită

## Ce NU mock-uiești

- **Limbajul și librăria standard.** Nu mock-ui `datetime` global; injectează un `clock`. Vezi [[Dependency injection]].
- **Baza de date, în testele de integrare.** Acolo vrei una reală — e tot rostul nivelului. Vezi [[Piramida testelor]].
- Obiecte de date simple. Construiește-le direct.

## Legături

- Face parte din: [[MOC Testare]]
- [[TDD - red green refactor]] · [[Piramida testelor]] · [[Ce nu merita testat]]
- [[Dependency injection]]
