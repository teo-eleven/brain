---
tags: [decision, adm-expert]
created: 2026-08-20
type: decision
status: adoptat
---

# Bugetul se șterge, nu se pune pe zero

**Decis pe 20.08.2026.** Al doilea ADR din vault, după [[Fara clone locale]].

## Decizia

Când ascunderea unei categorii din [[ADM Expert]] cere curățarea bugetului lunii, **rândul de
alocare se șterge**. Nu se pune pe 0.

## Contextul care a produs-o

Butonul de ștergere din fiecare rând de buget lunar era dezactivat pe orice categorie cu buget în
luna afișată. Pe datele demo trecea neobservat; pe datele de producție, 10 din 20 de categorii ale
Econfaire au buget, deci butonul nu mergea aproape niciodată. Cerința proprietarului a fost fără
echivoc: *„acesta ar trebui sa mearga mereu indiferent de ce se intampla inainte de a apasa
delete"*.

Ca butonul să meargă mereu, ascunderea trebuie să poată curăța bugetul lunii. Iar acolo erau două
variante, nu una.

## Alternativa respinsă: suma pe 0

Pare mai blândă — istoricul păstrează „a avut buget aici". Dar indexul `funded` e **sticky prin
construcție**: se aprinde la prima sumă nenulă și rămâne 1, fiindcă upsert-ul scrie
`max(funded_vechi, funded_nou)` (`repository.py:657`). Un rând coborât la 0 lei arată 0 pe ecran și
**blochează pentru totdeauna** ștergerea definitivă a categoriei.

Nu e ipotetic: exact asta pățise categoria „Altceva" din producție — 0 lei afișați, `funded = 1` în
bază, ștergere refuzată fără niciun motiv vizibil pe ecran. Varianta „pe 0" ar fi transformat
fiecare curățare în încă un rând-fantomă de felul acela.

## Ce câștigă ștergerea rândului

- dispare și indexul, deci o categorie fără cheltuieli **redevine** ștergibilă definitiv;
- totalul lunii rămâne corect, fără un rând invizibil care contribuie cu 0;
- e ce înțelege omul prin „șterge" — nu o stare intermediară pe care trebuie s-o explici.

## Ce NU s-a atins, deliberat

**Cheltuielile.** `expenses.category_id` are FK `RESTRICT`, iar facturile trimit spre cheltuieli;
17 din 20 de categorii Econfaire au cheltuieli reale. O ștergere în cascadă ar fi făcut butonul să
„meargă mereu" cu prețul a 586 de cheltuieli reale. „Merge mereu" nu merită prețul ăsta — ștergerea
definitivă rămâne gardată de cheltuieli, iar dialogul spune motivul.

## Consecințe de implementare

- Curățarea e **opt-in explicit** (`clear_budget=true`), nu implicită: scoate cifre din totalul
  lunii, deci trebuie să vină dintr-o apăsare conștientă, pe un dialog care scrie suma dinainte.
  Fără steag, refuzul de dinainte rămâne neschimbat.
- Steagul se leagă de **existența rândului**, nu de suma lui. Legat de „suma > 0", un rând de 0 lei
  cu `funded = 1` ar fi luat tot 409 — același defect, întors pe altă ușă.
- Curățarea trece prin `group_budget.delete_everywhere`: bugetul comun al grupului dispare din toate
  cele trei firme, nu doar din cea nimerită de id.

Commit: `290dc61`, branch `fix/stergere-categorie-cu-buget`. Ziua: [[2026-08-20]].
