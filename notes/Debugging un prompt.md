---
tags: [note, workflow]
created: 2026-08-11
type: note
status: schelet
---

# Debugging un prompt

Metodă, nu inspirație. Un prompt „reparat" din intuiție e un prompt ghicit.

## Pașii

### 1. Izolez cazul

Un singur document, un singur câmp, cel mai mic input care reproduce defectul.
Nu depanez pe suita întreagă — acolo se amestecă prea multe variabile.

### 2. Fixez ce pot fixa

- `temperature: 0` (sau cât de jos permite modelul);
- seed, dacă furnizorul îl acceptă prin [[LiteLLM - gateway pentru modele]];
- aceeași versiune de model, explicit, nu un alias care se mută sub mine;
- același set de date.

Fără asta, orice diferență observată poate fi doar varianță.

### 3. Stabilesc reproductibilitatea ÎNAINTE de orice concluzie

- 1 rulare = anecdotă;
- 4 rulări consecutive cu același rezultat = semnal.

Exemplu real: separatorul ambiguu. 6/6 cantități în format anglo-saxon citite de
1000× mai mare (`1.750 to` → 1750), reproductibil în 4 rulări. Asta e defect, nu
ghinion.

### 4. Schimb UN singur lucru o dată

O instrucțiune, un exemplu, o secțiune. Dacă schimb trei și se repară, nu știu
care a contat — și nu pot să-l apăr la următoarea regresie.

### 5. Compar pe același set

Rulez varianta nouă pe exact aceleași cazuri ca baseline-ul. Vezi
[[Evals inainte de prompt changes]] și [[Versionarea prompturilor]].

## Când e prompt și când e model

E **prompt / configurare** dacă:

- formatul așteptat nu e spus explicit (locale, separator zecimal, unitate);
- lipsesc exemple pentru exact cazul care cade;
- instrucțiunile se contrazic între system și user;
- o formulare mai strictă repară defectul stabil, pe 4 rulări.

E **limită de model** dacă:

- defectul persistă după ce instrucțiunea e explicită și exemplificată;
- apare identic la mai multe formulări diferite;
- modelul „înțelege" regula când o întrebi, dar tot greșește la execuție.

Concluzia practică pentru separatorul ambiguu: dacă nu se repară din prompt,
soluția nu e un prompt mai lung, ci **validare deterministă după extracție** —
un parser care normalizează numărul și respinge valorile imposibile. Vezi
[[Validarea output-ului LLM]].

## Capcane

- Repar promptul pentru cazul de test și stric alte cazuri — de aia compar pe set.
- Cred că am schimbat promptul, dar rula versiunea din cache / din alt fișier.
- Confund output tăiat cu output greșit. Verific `finish_reason` întâi:
  [[Cum citesc un trace]].
- Judec cu [[LLM as judge]] fără să verific mai întâi că judecătorul e calibrat
  pe [[Ground truth pentru evaluare]].

## De răspuns

- Câte rulări declar minimul pentru „reproductibil" în harness, nu doar în cap?
- Unde trag linia între reparat-din-prompt și validare deterministă?
- Cum înregistrez ipotezele testate, ca să nu reiau aceleași încercări peste o lună?
- Merită un set mic de „cazuri capcană" pe formate numerice, rulat la fiecare PR?
- Ce fac când modelul se schimbă sub mine (versiune nouă la furnizor)?

Legături: [[MOC AI Engineer]], [[MOC Operatii zilnice]], [[QA AI Agent]]
