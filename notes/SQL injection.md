---
tags: [security, database, sql]
created: 2026-08-06
type: permanent
---

# SQL injection

## Ideea

Dacă input-ul utilizatorului ajunge în textul unei interogări, utilizatorul scrie SQL. Nu „poate scrie" — scrie.

```python
# Vulnerabil
db.execute(f"SELECT * FROM users WHERE email = '{email}'")
# email = "' OR '1'='1" → întoarce toți utilizatorii
# email = "'; DROP TABLE users; --" → exact ce pare
```

## Fixul: parametrizare, nu escaping

```python
db.execute("SELECT * FROM users WHERE email = %s", (email,))
```

Diferența e fundamentală: driverul trimite **interogarea și datele separat**. Baza de date primește structura întâi, apoi valorile — care nu mai pot schimba structura, indiferent ce conțin.

Escaping manual (înlocuiești `'` cu `''`) e o cursă înarmată pe care o pierzi: encodări multibyte, backslash-uri, dialecte diferite. Nu intra în ea.

## Ce NU rezolvă problema

- **Escaping cu funcții scrise de tine** — vezi mai sus
- **Validarea input-ului** — utilă ca strat suplimentar, dar nu suficientă. Un nume legitim conține apostrof (`O'Brien`).
- **Un ORM, automat** — ORM-urile parametrizează implicit, dar orice `raw()`, `text()`, `extra()` sau f-string strecurat înapoi la SQL brut reintroduce vulnerabilitatea:

```python
# Vulnerabil, chiar și cu SQLAlchemy
db.execute(text(f"SELECT * FROM facturi WHERE status = '{status}'"))

# Corect
db.execute(text("SELECT * FROM facturi WHERE status = :s"), {"s": status})
```

## Ce nu se poate parametriza

**Nume de tabele, coloane și direcția de sortare nu pot fi parametri.** Pentru `ORDER BY {coloana}` singura soluție corectă e o **listă albă**:

```python
COLOANE_PERMISE = {"data", "valoare", "numar"}
if coloana not in COLOANE_PERMISE:
    raise ValueError("coloană invalidă")
```

Aici e locul unde apar cele mai multe injecții în cod modern — restul e de obicei parametrizat corect.

## Apărare în adâncime

- Utilizator de DB cu **drepturi minime** (aplicația nu are nevoie de `DROP`)
- Interogări doar prin stratul de acces la date, niciodată împrăștiate
- Loghează erorile de SQL — o rafală de erori de sintaxă e semnătura unui scan automat

## Legături

- Face parte din: [[MOC Securitate]] · [[MOC Baze de date]]
- [[OWASP Top 10 - pe scurt]] · [[XSS]] — aceeași clasă: date tratate ca cod
- [[Pydantic - validare la boundary]]
