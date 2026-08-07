---
tags: [learning, workflow]
created: 2026-08-06
type: permanent
---

# Cum citesc un codebase nou

## Regula

**Nu citi de la fișierul 1 la fișierul 500.** Nu funcționează, nu vei termina, și nu vei reține nimic.

Codul se citește **pe verticală, urmărind un flux**, nu pe orizontală.

## Procedura

**1. README, apoi cum se pornește.** Reușește să-l rulezi local înainte de orice altceva. Un proiect pe care nu-l poți rula nu poți nici explora — și dacă instrucțiunile de setup sunt rupte, ai aflat primul lucru util.

**2. Structura de foldere, 2 minute.** Care e stratul de intrare (API/UI), unde e logica, unde sunt datele. Nu detalii, doar harta.

**3. Modelul de date.** Migrările sau modelele. Structura datelor îți spune ce face aplicația mai clar decât orice cod. Începe aici dacă ai timp doar pentru un lucru.

**4. Urmărește UN flux, complet, de la capăt la capăt.** Alege ceva simplu (login, sau creare de resursă) și mergi: rută → handler → serviciu → bază de date → răspuns. Ăsta e pasul care produce înțelegerea reală — descoperi convențiile, straturile, stilul de erori, cum se testează, toate simultan.

**5. `git log` și „unde se schimbă des".**
```bash
git log --oneline -30
git log --format=%H | head -500 | xargs -n1 git show --name-only --format="" | sort | uniq -c | sort -rn | head -20
```
Fișierele modificate cel mai des sunt fie miezul aplicației, fie zonele problematice. În ambele cazuri, exact ce te interesează.

**6. Testele ca documentație.** Un test bun arată cum e menit să fie folosit codul, cu exemple executabile. Adesea mai onest decât README-ul.

**7. Fă o modificare mică.** Un text, un log, un mic fix. Ciclul complet (modific → rulez → văd rezultatul) îți dă mai mult decât 3 ore de citit.

## Ce notezi în vault

O notă de proiect (`_templates/Proiect`) cu:
- comanda de pornire, de teste, de migrare — cele pe care le uiți mereu
- diagrama fluxului principal, 5 linii de text
- **întrebări cu `#question`** — ce nu înțelegi încă. Peste o săptămână, jumătate se răspund singure; cealaltă jumătate merită întrebate.
- convenții observate (denumiri, structură de erori, cum se organizează testele)

## Capcane

- **Citit fără să rulezi** — reții 10%
- **Încercarea de a înțelege tot înainte de a atinge ceva** — nu vei termina niciodată
- **Judecarea codului înainte de a-i afla constrângerile.** Aproape orice cod ciudat a avut un motiv. Întreabă înainte să rescrii — vezi [[ADR - decizie tehnica]] pentru de ce deciziile merită documentate.

## Legături

- Face parte din: [[MOC Invatare si Cariera]] · [[MOC Programare]]
- [[Debugging metodic]] · [[Cuplare si coeziune]] · [[Git cheatsheet]]
