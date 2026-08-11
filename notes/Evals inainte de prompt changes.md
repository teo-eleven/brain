---
tags: [note, ai]
created: 2026-08-11
type: note
status: schelet
---

# Evals inainte de prompt changes

## De ce e aici

Tot ce s-a construit în ultimele două zile — metricile PRIMARY fixe, harness-ul,
datasetul de 9 cazuri, tracing-ul reparat pe 11.08 (`b1c56f6`) — există ca să
poți răspunde la o singură întrebare: „modificarea asta de prompt a ajutat sau a
stricat?".

Fără ea, orice schimbare de prompt e ghicit. Rulezi pe două documente, arată
bine, dai drumul. Bug-urile de eșec tăcut au arătat cât de ușor e ca „arată bine"
să însemne de fapt „nu s-a măsurat nimic".

## Ce trebuie știut

**Evals = teste, dar cu toleranță la nedeterminism.** Un test clasic e binar și
repetabil. Un eval rulează pe un dataset, produce o distribuție și se compară cu
un prag. De aici două consecințe practice: rulezi același caz de mai multe ori
(`pass^3` ≥ 90%) și nu interpretezi diferențe sub pragul de zgomot.

**Zgomotul, concret:** cu 9 cazuri, un singur caz valorează 11pp. O „regresie"
de 3pp e imposibil de observat — ai nevoie de ~100+ cazuri ca 3pp să fie semnal.
Până atunci, singurele verdicte credibile sunt cele pe praguri absolute
(injection = 0 breșe, buget de pași depășit, rulare degradată).

**Ordinea corectă la o modificare de prompt:**

1. rulezi baseline pe promptul actual, salvezi cifrele;
2. modifici promptul, o singură schimbare;
3. rulezi din nou, ACELAȘI dataset, aceleași setări;
4. compari — și verifici întâi că rularea nu e degradată (fallback, joburi
   eșuate, span-uri lipsă), altfel nu compari nimic;
5. păstrezi versiunea promptului împreună cu cifrele ei.

**Promptul e cod.** Are versiune, are istoric, are rezultatele atașate. Un prompt
fără cifre lângă el e o părere.

## De răspuns

- Am baseline salvat pe promptul curent, sau ultima cifră e dintr-o rulare
  degradată?
- Câte cazuri în plus îmi trebuie ca să pot vorbi despre regresii mici, și de
  unde le iau cel mai ieftin?
- Rulez promptfoo separat de harness-ul principal — ce testez în fiecare, ca să
  nu dublez?
- Ce fac când o schimbare îmbunătățește task success dar crește costul peste
  +20%? Cine arbitrează între metrici?
- Cum leg o versiune de prompt de trace-urile rulării ei, ca să pot reface
  comparația peste o lună?

## Legat

- [[Metrici pentru agenti AI]]
- [[Ground truth pentru evaluare]]
- [[LLM as judge]]
- [[Versionarea prompturilor]]
- [[Debugging un prompt]]
- [[promptfoo - teste pe prompturi]]
- [[Fluxul zilnic de evaluare]]
- [[MOC AI Engineer]]
