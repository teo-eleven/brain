---
tags: [note, testare, ai]
created: 2026-08-11
type: note
status: schelet
---

# Înregistrare și reluare în teste

## De ce e aici

11.08, `70f46f9`: „suita rulează gratis, fără rețea". Răspunsurile agentului se înregistrează o
dată, iar rulările următoare le redau din fișier în loc să apeleze modelul.

Problema pe care o rezolvă era concretă: proxy-ul căzuse de două ori într-o zi, iar o rulare cu
8 din 9 joburi eșuate nu e un rezultat, e zgomot de infrastructură. Plus, fiecare iterație pe
graderi costa tokeni pentru un răspuns pe care îl aveai deja.

## Ideea

**Separă ce testezi de ce apelezi.** Când lucrezi la graderi, la metrici sau la raport, modelul
nu e obiectul testului — e o dependință externă, lentă, scumpă și nesigură. Îl înlocuiești cu
înregistrarea lui.

Ce câștigi:

- **cost zero** pe iterațiile de dezvoltare a evaluatorului
- **determinism** — aceleași intrări, același verdict, deci o diferență de scor înseamnă că _tu_
  ai schimbat ceva
- **independență de infrastructură** — suita merge și când proxy-ul e căzut, și în CI fără chei
- **viteză** — secunde în loc de minute

Ideea nu e nouă: `vcr`/`cassette` în testarea HTTP face exact asta de un deceniu. Nou e că la
LLM-uri câștigul e mai mare, fiindcă apelul e mai scump și mai nedeterminist.

## Capcana

Înregistrarea **îngheață** comportamentul modelului. Suita rămâne verde chiar dacă modelul real
s-a schimbat sub tine — furnizorul a actualizat versiunea, promptul a fost editat, temperatura
diferă. E [[Esecul tacut in sisteme AI]] în altă formă: verde pe o realitate expirată.

Antidot: rulări **live** periodice, separate de cele pe înregistrări, care reîmprospătează
cassette-urile și semnalează diferențele. Înregistrarea e pentru iterat, nu pentru verdictul final.

## Aceeași idee, alt strat: interfața (12.08)

„Separă ce testezi de ce apelezi" nu e despre LLM-uri — e despre orice dependință externă. Aplicat
la un panou de tablou care citește din trei servicii: panoul rulat **în Node, cu un DOM minimal
inventat** (`getElementById` întoarce un obiect cu `innerHTML`) și cu `fetch` înlocuit. Fără
browser, fără server pornit.

Două moduri, amândouă necesare:

- **`fetch` real către proxy-ul local** — verifică pe datele adevărate: se randează toate cele 18
  rânduri, zero `undefined` scăpat în HTML.
- **`fetch` cu răspunsuri fabricate** — patru scenarii pe care realitatea _nu ți le dă la cerere_:
  toate sursele picate cu 500, dataset lipsă, rută respinsă de proxy cu 403, și cazul cu rulări +
  reguli existente (instanța are 0, deci ramura aia nu s-ar executa niciodată local).

Al doilea mod e argumentul întreg. Ramurile de eșec sunt exact cele care nu se exersează în
practică, fiindcă apar când ceva e deja stricat — și tocmai ele decid dacă tabloul spune „n-am
putut citi" sau afișează un tabel gol care pare în regulă ([[Esecul tacut in sisteme AI]]).

Limita, spusă direct: pe scenariul fabricat verifici **codul tău**, nu forma reală a răspunsului
serverului. Pentru regulile de evaluare, forma exactă a rămas neverificată — instanța are 0 —
deci câmpurile se citesc defensiv și asta e scris în cod, nu presupus rezolvat.

## De răspuns

- Cât de des trebuie reîmprospătate înregistrările ca să nu testez un model care nu mai există?
- Ce se înregistrează exact — răspunsul brut, trace-ul complet, sau ambele?
- Cum marchez în raport că un rezultat vine din reluare, nu din rulare live?
- Ce teste NU au voie să ruleze pe înregistrări? (probabil cele care validează chiar integrarea)
- Înregistrările intră în git? Devin mari repede și conțin output de model.
- Scenariile de eșec fabricate ar trebui să devină teste rulate în CI, sau rămân scripturi de
  verificat o dată? Un script care nu mai rulează nu apără nimic.

## Legat

- [[Fluxul zilnic de evaluare]] — unde intră în rutina zilnică
- [[DeepEval - evaluare automata]] — unde se rulează graderii pe înregistrări
- [[Esecul tacut in sisteme AI]] — capcana verdelui pe realitate expirată
- [[Evals inainte de prompt changes]] · [[Metrici pentru agenti AI]]
