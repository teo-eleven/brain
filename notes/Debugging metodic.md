---
tags: [debugging, learning]
created: 2026-08-06
type: permanent
---

# Debugging metodic

## Ideea

Debugging-ul nu e ghicit. E metoda științifică aplicată la cod: **ipoteză → test → eliminare**.

Alternativa — schimbi lucruri la întâmplare până „merge" — funcționează uneori și te lasă fără să știi ce era. Bug-ul revine.

## Procedura

**1. Reproduce.** Un bug care nu poate fi reprodus nu poate fi reparat. Găsește pașii minimi. Adesea reducerea la minim dezvăluie singură cauza.

**2. Citește eroarea. Toată.** Inclusiv stack trace-ul, inclusiv „Caused by" de la sfârșit. Cea mai mare parte din timpul pierdut la debugging vine din a nu citi ce scrie pe ecran.

**3. Formulează o ipoteză falsificabilă.** Nu „ceva e greșit cu data". Ci: *„presupun că data ajunge ca string, nu ca obiect date, în funcția X."* O ipoteză bună poate fi dovedită greșită.

**4. Testează ipoteza cea mai ieftină prima.** Un `print` de 5 secunde bate 20 de minute de citit cod.

**5. Înjumătățește spațiul de căutare.** Bisecție: unde e datele corecte și unde nu mai sunt? Verifică la mijloc. Repetă. E același principiu ca [[Git bisect]], aplicat la fluxul de date în loc de timp.

**6. Repară cauza, nu simptomul.** Un `try/except` care ascunde eroarea nu e un fix.

**7. Scrie un test care reproduce bug-ul**, apoi verifică că trece după fix. Vezi [[TDD - red green refactor]].

## Întrebările care sparg blocajele

- **Ce s-a schimbat?** Mergea înainte? → `git log`, `git bisect`
- **Sunt sigur că se execută codul ăsta?** Pune un print. De multe ori nu se execută.
- **Ce presupun și n-am verificat?** Aici se ascunde bug-ul, aproape mereu.
- **Datele sunt ce cred că sunt?** Printează tipul și valoarea, nu doar valoarea. `"5"` și `5` arată identic la print.
- **Merge într-un mediu și nu în altul?** → config, versiuni, [[12 factor app]] punctul 4.

## Când te-ai blocat 30 de minute

- **Explică problema cu voce tare** — vezi [[Rubber duck debugging]]
- **Ia o pauză.** Nu e lene; e cel mai eficient instrument pentru fixație.
- **Scrie ce ai eliminat** — în daily note. Te oprește din a verifica de trei ori același lucru.
- **Cere ajutor cu context complet**: ce am încercat, ce am eliminat, ce presupun.

## Anti-pattern-uri

- Schimbări multiple simultan → nu știi care a rezolvat
- „Merge acum, nu știu de ce" → încă nu e reparat, doar ascuns
- Debugging prin adăugarea de retry-uri
- Presupunerea că bug-ul e în framework. Uneori e. De obicei nu.

## Legături

- Face parte din: [[MOC Invatare si Cariera]] · [[MOC Programare]]
- [[Rubber duck debugging]] · [[Git bisect]] · [[EXPLAIN ANALYZE]]
- [[TDD - red green refactor]] · [[Observability - logs metrics traces]]
