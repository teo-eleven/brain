---
tags: [security, backend]
created: 2026-08-06
type: permanent
---

# Autentificare vs autorizare

## Ideea

- **Autentificare (authN)** — *cine ești?* Login, token, parolă. Răspuns: identitate.
- **Autorizare (authZ)** — *ce ai voie?* Roluri, permisiuni, proprietate. Răspuns: da/nu pentru o acțiune pe un obiect.

Coduri HTTP: **401** = nu știu cine ești. **403** = știu, n-ai voie. Vezi [[HTTP status codes care conteaza]].

## De ce distincția e importantă practic

Autentificarea e o problemă **rezolvată**: folosești o librărie sau un provider (OAuth, Auth0, Keycloak) și nu scrii tu criptografie.

Autorizarea e **specifică aplicației tale** și nimeni nu o poate rezolva în locul tău. De asta e și locul unde apar bug-urile — OWASP #1, „Broken Access Control".

## Bug-ul clasic: IDOR

```python
@app.get("/facturi/{id}")
def get_factura(id: int, user = Depends(current_user)):
    return db.get(Factura, id)      # BUG: verifică DOAR autentificarea
```

Utilizatorul e autentificat legitim. Schimbă `/facturi/42` în `/facturi/43` și vede factura altcuiva. Asta e IDOR (Insecure Direct Object Reference) și e cea mai comună vulnerabilitate reală din aplicațiile de business.

```python
# Corect: verifică PROPRIETATEA, nu doar identitatea
f = db.query(Factura).filter_by(id=id, tenant_id=user.tenant_id).first()
if not f:
    raise HTTPException(404)
```

Întorci **404**, nu 403 — altfel confirmi că factura există, ceea ce permite enumerarea.

## Regula operațională

**Fiecare endpoint răspunde la două întrebări separate:**
1. Ești autentificat? (middleware, uniform, o dată)
2. Ai drept pe **acest obiect specific**? (per endpoint, per resursă)

Punctul 2 nu poate fi rezolvat de un middleware generic, pentru că depinde de datele cerute. De asta se uită.

## Modele de autorizare

| Model | Când |
|---|---|
| **RBAC** (roluri) | simplu, acoperă majoritatea: admin/user/viewer |
| **ABAC** (atribute) | reguli care depind de date („doar facturile din departamentul lui") |
| **ReBAC** (relații) | partajări granulare, tip Google Docs |

Începe cu RBAC. Nu construi ABAC pentru „viitor" — [[KISS DRY YAGNI]].

## Ce previne bug-urile

- Filtrul de proprietate în **stratul de acces la date**, nu în fiecare endpoint. Vezi [[Multi-tenancy - patterns]].
- Test automat: cu tokenul lui B, ceri resursa lui A → aștepți 404. Un test per tip de resursă.
- ID-uri nesecvențiale (UUID) — nu e securitate, dar face enumerarea nepractică.

## Legături

- Face parte din: [[MOC Securitate]] · [[MOC Backend si API]]
- [[JWT - ce e si ce nu e]] · [[Multi-tenancy - patterns]]
- [[OWASP Top 10 - pe scurt]] · [[HTTP status codes care conteaza]]
