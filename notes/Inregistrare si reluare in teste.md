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

## De răspuns

- Cât de des trebuie reîmprospătate înregistrările ca să nu testez un model care nu mai există?
- Ce se înregistrează exact — răspunsul brut, trace-ul complet, sau ambele?
- Cum marchez în raport că un rezultat vine din reluare, nu din rulare live?
- Ce teste NU au voie să ruleze pe înregistrări? (probabil cele care validează chiar integrarea)
- Înregistrările intră în git? Devin mari repede și conțin output de model.

## Legat

- [[Fluxul zilnic de evaluare]] — unde intră în rutina zilnică
- [[DeepEval - evaluare automata]] — unde se rulează graderii pe înregistrări
- [[Esecul tacut in sisteme AI]] — capcana verdelui pe realitate expirată
- [[Evals inainte de prompt changes]] · [[Metrici pentru agenti AI]]
