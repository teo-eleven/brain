---
tags: [note, debugging, metoda]
created: 2026-08-11
type: note
status: schelet
---

# Experiment înainte de concluzie

## De ce e aici

11.08, `d141dfd`. Agentul de extracție citea cantitățile în format anglo-saxon de 1000× mai mare:
`1.750 to` devenea `1750`. Șase din șase cazuri, reproductibil în **patru rulări consecutive**.

Concluzia care se cerea singură: modelul nu înțelege separatorul zecimal, e o limită
fundamentală, deci trebuie prinsă cu validare deterministă după extracție.

Concluzia era greșită. Un experiment cu promptul modificat a reparat-o.

## Ideea

**Reproductibilitatea dovedește că există o cauză, nu care e cauza.** Patru rulări identice
elimină hazardul — atât. Nu spun nimic despre unde stă problema: prompt, configurare, date sau
model. Toate produc eșecuri la fel de stabile.

Diferența dintre cele două verdicte era enormă în consecințe:

| Dacă e limită de model                            | Dacă e problemă de prompt    |
| ------------------------------------------------- | ---------------------------- |
| accepți că nu se poate                            | se repară azi                |
| construiești validare deterministă după extracție | schimbi câteva rânduri       |
| documentezi ca limitare cunoscută                 | dispare din lista de defecte |

Costul experimentului a fost o rulare. Costul concluziei greșite ar fi fost un strat de cod
scris degeaba, plus o limitare falsă în documentație.

## Cum arată în practică

1. Formulează ipoteza ca ceva **falsificabil**: „dacă e promptul, atunci schimbând X se repară"
2. Schimbă **un singur lucru**
3. Rulează pe **același set** de cazuri
4. Dacă nu se schimbă nimic, ipoteza e eliminată — și asta e tot informație

Ordinea de verificat, de la ieftin la scump: configurare → prompt → date de intrare → model.
Majoritatea „limitelor de model" mor la primele două.

## De răspuns

- Câte dintre defectele pe care le-am catalogat ca „limită de model" au trecut printr-un
  experiment care le-ar fi putut infirma?
- Aritmetica din cazurile de interogare — e chiar limită, sau e tot netestată la fel?
- Cum arată un experiment care poate **eșua** informativ, nu doar unul care confirmă ce cred deja?
- Când e prea scump un experiment și accepți concluzia fără el?

## Legat

- [[Debugging un prompt]] — mecanica: un lucru o dată, pe același set
- [[Esecul tacut in sisteme AI]] — cealaltă față: concluzii trase din semnale care nu există
- [[Metrici pentru agenti AI]] · [[Fluxul zilnic de evaluare]]
