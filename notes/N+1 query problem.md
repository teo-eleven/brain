---
tags: [database, performance, orm]
created: 2026-08-06
type: permanent
---

# N+1 query problem

## Ideea

O interogare aduce N rânduri. Apoi, pentru fiecare rând, codul face încă o interogare. Total: **1 + N** interogări în loc de 1 sau 2.

```python
facturi = db.query(Factura).all()          # 1 query
for f in facturi:
    print(f.client.nume)                   # +1 query pentru FIECARE factură
```

100 de facturi = 101 interogări. Fiecare cu latența ei de rețea. 5 ms × 101 = o jumătate de secundă pentru ceva ce ar lua 10 ms.

## De ce e bug-ul #1 de performanță în API-uri

Pentru că **nu se vede în cod.** `f.client.nume` arată ca un acces la un atribut, nu ca o cerere de rețea. ORM-ul face lazy loading pe la spate, în liniște.

Și pentru că **nu se vede în dezvoltare.** Cu 10 rânduri de test e imperceptibil. În producție, cu 5.000, endpoint-ul face timeout.

## Fixul

**Încarci relația odată, explicit:**

```python
# SQLAlchemy
facturi = db.query(Factura).options(joinedload(Factura.client)).all()

# Django
facturi = Factura.objects.select_related("client")        # FK / one-to-one
facturi = Factura.objects.prefetch_related("linii")       # many-to-many / reverse FK
```

Sau, dacă nu ai nevoie de obiecte întregi, un singur `JOIN` scris de mână.

## Cum îl detectezi

- **Numără interogările în teste.** Un test care asertează „acest endpoint face maxim 3 queries" prinde regresia înainte de producție. E cel mai bun ROI dintre toate testele de performanță.
- Loghează SQL în development (`echo=True` la SQLAlchemy, django-debug-toolbar).
- În producție: [[Observability - logs metrics traces]] — un trace arată 101 span-uri de DB, evident la privire.

## Capcane

- `joinedload` pe mai multe relații one-to-many duce la explozie de rânduri (produs cartezian). Pentru mai multe colecții, `selectinload` e de obicei mai bun.
- Fixul aplicat orb (eager load pe tot) încarcă date pe care nu le folosești. Măsoară.
- Apare și **fără** ORM: o buclă care apelează un API extern pentru fiecare element e același bug. Vezi [[Python async - model mental]] pentru varianta concurentă.

## Legături

- Face parte din: [[MOC Baze de date]] · [[MOC Backend si API]]
- [[EXPLAIN ANALYZE]] · [[Indexuri - cand ajuta si cand nu]]
- [[Ce nu merita testat]] — dar numărul de queries merită
