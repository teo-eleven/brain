---
tags: [snippet, python, fastapi, security]
created: 2026-08-06
type: snippet
lang: python
---

# FastAPI - dependency de tenant

**Limbaj:** Python / FastAPI · **Testat:** schelet, adaptează la modelul tău de auth

## Problema pe care o rezolvă

Într-o aplicație multi-tenant, `tenant_id` trebuie să vină **din token**, niciodată din request. Și trebuie aplicat automat, ca să nu depindă de disciplina fiecărui endpoint. Vezi [[Multi-tenancy - patterns]].

## Cod

```python
from typing import Annotated, AsyncIterator
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

# 1. sesiune de DB
async def get_db() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as s:
        yield s

# 2. utilizatorul curent, din token
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])   # algoritm FIXAT
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "token invalid")

    user = await db.get(User, payload.get("sub"))
    if user is None or not user.activ:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "utilizator inactiv")
    return user

# 3. tenantul — DERIVAT din user, nu din request
async def get_tenant_id(
    user: Annotated[User, Depends(get_current_user)],
) -> int:
    return user.tenant_id

CurrentUser = Annotated[User, Depends(get_current_user)]
TenantId    = Annotated[int,  Depends(get_tenant_id)]
Db          = Annotated[AsyncSession, Depends(get_db)]
```

## Cum îl folosesc

```python
@app.get("/facturi/{factura_id}")
async def citeste(factura_id: int, tenant: TenantId, db: Db) -> FacturaOut:
    f = await db.scalar(
        select(Factura).where(
            Factura.id == factura_id,
            Factura.tenant_id == tenant,      # filtrul de izolare
        )
    )
    if f is None:
        raise HTTPException(404)              # 404, nu 403 — nu confirmăm existența
    return FacturaOut.model_validate(f)
```

Alias-urile `Annotated` fac semnăturile scurte și consecvente în tot proiectul.

## În teste

```python
app.dependency_overrides[get_db] = get_test_db
app.dependency_overrides[get_current_user] = lambda: User(id=1, tenant_id=7)
```

Ăsta e câștigul concret al [[Dependency injection]]: înlocuiești autentificarea și baza de date fără să atingi endpoint-urile.

**Testul care nu trebuie să lipsească:** cu tokenul tenantului 7, ceri o factură a tenantului 8 → aștepți 404. Unul per tip de resursă.

## Atenție

- **Nu accepta niciodată `tenant_id` din body sau query.** Ar fi o vulnerabilitate directă.
- Filtrul din `where` trebuie în **fiecare** interogare. Ca să nu depinzi de memorie, mută-l într-un repository de bază sau activează Row-Level Security în Postgres.
- Indexurile trebuie să înceapă cu `tenant_id` — vezi [[Indexuri - cand ajuta si cand nu]].
- Algoritmul JWT trebuie **fixat explicit** la decodare, altfel accepți `alg: none`. Vezi [[JWT - ce e si ce nu e]].

## Legături

- [[Multi-tenancy - patterns]] · [[Dependency injection]] · [[Autentificare vs autorizare]]
- [[JWT - ce e si ce nu e]] · [[MOC Backend si API]]
