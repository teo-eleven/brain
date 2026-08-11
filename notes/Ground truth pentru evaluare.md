---
tags: [note, ai, testare, eval]
created: 2026-08-11
type: note
status: schelet
---

# Ground truth pentru evaluare

> [!warning] Schelet — de completat de tine

## De ce e aici

Fără adevăr de referință, o evaluare nu măsoară nimic — compară output-ul cu o părere.

La agentul de extracție, ground truth-ul e **scris de mână** (~5 min/caz), singurul tip care
cere timp de om. Asta a fost blocajul până pe 11.08, când l-ai ocolit: **documente fabricate cu
ground truth cunoscut prin construcție** (`generators/`, 9 documente). Nu rezolvă
reprezentativitatea, dar deblochează pornirea.

Datasetul a fost escaladat în runde: realiste → brutale → _nivelul următor, construit pe ce a
rezistat_. Nu scris o dată, ci crescut pe baza a ce a trecut.

## De răspuns

- Fabricat vs real: ce testează fiecare? (bănuiala ta despre ce se rupe vs ce se rupe de fapt)
- Cât de mare trebuie setul? Eșantionare stratificată — pe ce dimensiuni stratifici?
- Cum eviți ca datasetul să devină o colecție de cazuri pe care agentul deja le trece?
- Când datasetul trebuie actualizat, dacă agentul se schimbă sub el?
- Anonimizarea documentelor reale: ce se pierde odată cu datele personale?

## Legat

- [[Metrici pentru agenti AI]] · [[LLM as judge]]
- [[Coverage - metrica utila si capcana]] — aceeași capcană a numărului mare fără sens
- [[Piramida testelor]]
