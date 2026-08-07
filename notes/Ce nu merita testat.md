---
tags: [testing]
created: 2026-08-06
type: permanent
---

# Ce nu merita testat

## Ideea

Fiecare test are un cost permanent: îl scrii o dată, îl întreții mereu, îl rulezi de mii de ori. Un test care nu poate prinde un bug realist e cost pur.

## Ce nu testezi

**1. Framework-ul și librăriile.** Nu testezi că React randează, că SQLAlchemy salvează, că Pydantic validează un `int`. Au propriile teste, scrise de oameni mai apropiați de cod.

**2. Getteri, setteri, DTO-uri.** `test_nume_returneaza_nume` nu a prins niciodată nimic.

**3. Detalii de implementare privată.** Dacă testul apelează `_metoda_privata`, se va sparge la prima refactorizare care nu schimbă comportamentul. Testează prin interfața publică.

**4. Mock-uri care se testează pe ele însele.**
```python
mock.calculeaza.return_value = 100
assert serviciu.total() == 100     # ai testat mock-ul
```

**5. Config și constante.** `assert TIMEOUT == 30` — dacă cineva schimbă constanta, schimbă și testul. Zero informație.

**6. Fiecare permutare posibilă.** Trei cazuri bine alese (normal, limită, invalid) valorează mai mult decât 40 generate mecanic.

**7. UI vizual, prin assert-uri.** „Butonul e albastru" nu se testează în unit test — se vede. Pentru regresie vizuală există screenshot testing, un instrument separat cu compromisuri proprii.

## Ce merită mereu

- **Logica de business**, mai ales bani, taxe, date calendaristice, rotunjiri
- **Cazuri limită**: zero, negativ, gol, null, foarte mare, caractere speciale, diacritice
- **Fiecare bug găsit** → un test care îl reproduce, înainte de fix. Vezi [[TDD - red green refactor]].
- **Drepturi de acces**: utilizatorul A nu vede datele lui B. Vezi [[Autentificare vs autorizare]] și [[Multi-tenancy - patterns]].
- **Contracte de API**: forma răspunsului nu se schimbă accidental. Vezi [[API versioning]].
- **Numărul de interogări** pe endpoint-urile importante — vezi [[N+1 query problem]].

## Testul de decizie

Înainte să scrii un test, întreabă: **„ce bug realist prinde ăsta?"**

Dacă răspunsul e „niciunul" sau „doar dacă cineva șterge intenționat cod", nu-l scrie. Dacă e „calcul greșit de TVA la facturi cu discount", scrie-l acum.

## Legături

- Face parte din: [[MOC Testare]]
- [[Coverage - metrica utila si capcana]] · [[Piramida testelor]]
- [[Test doubles - mock stub fake spy]] · [[KISS DRY YAGNI]]
