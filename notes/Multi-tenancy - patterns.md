---
tags: [architecture, database, security, backend]
created: 2026-08-06
type: permanent
---

# Multi-tenancy - patterns

## Ideea

Un cod, o instanță, mai mulți clienți (tenants) care nu trebuie **niciodată** să-și vadă datele.

## Trei modele

| Model | Izolare | Cost | Când |
|---|---|---|---|
| **Coloană `tenant_id`** | logică (cod) | mic | default, majoritatea cazurilor |
| **Schemă per tenant** | medie (DB) | mediu | zeci de tenanți, cerințe de separare |
| **Bază per tenant** | totală | mare | enterprise, reglementări, tenanți foarte mari |

Începe cu **coloană**. Migrarea spre schemă/bază separată e posibilă mai târziu; invers e mai greu.

## Riscul real

Cu `tenant_id`, un singur `WHERE` uitat scurge datele unui client către altul. Ăsta e cel mai grav bug pe care îl poți livra — nu e „un bug", e un incident de securitate raportabil.

**Nu te baza pe disciplină.** Oamenii uită `WHERE`. Mecanismele care chiar funcționează:

1. **Row-Level Security în Postgres** — baza de date refuză rândurile altui tenant, indiferent ce scrie codul. Cea mai puternică plasă de siguranță.
2. **Repository de bază care injectează filtrul** — nicio interogare nu se scrie direct, toate trec printr-un strat care adaugă `tenant_id`.
3. **Tenant din context injectat**, niciodată dintr-o variabilă globală sau dintr-un parametru trimis de client. Vezi [[Dependency injection]] și [[FastAPI - dependency de tenant]].
4. **Test dedicat**: creezi două tenant-uri, ceri datele lui A cu tokenul lui B, aștepți 404. Rulează la fiecare CI.

## Capcane

- **`tenant_id` din body/query = vulnerabilitate.** Vine din token, întotdeauna.
- Indexurile trebuie să înceapă cu `tenant_id` — altfel fiecare query scanează date ale tuturor. Vezi [[Indexuri - cand ajuta si cand nu]].
- Migrările atinge toți tenanții simultan: vezi [[Migrari zero-downtime]].
- Datele agregate cross-tenant (rapoarte interne) au nevoie de o cale explicită, marcată clar, altfel cineva o va folosi accidental într-un endpoint de client.

## Legături

- Face parte din: [[MOC Arhitectura]] · [[MOC Baze de date]] · [[MOC Securitate]]
- [[Autentificare vs autorizare]] · [[Dependency injection]]
- Aplicat: [[ADM Expert]]
