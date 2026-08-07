---
tags: [database, performance, backend]
created: 2026-08-06
type: permanent
---

# Connection pooling

## Ideea

Deschiderea unei conexiuni la Postgres costă zeci de milisecunde și un **proces** pe server. Un pool ține un set de conexiuni deschise și le împrumută cererilor.

## De ce API-ul cade la 100 de utilizatori

Postgres are `max_connections` (default ~100). Fiecare conexiune = un proces cu memoria lui. Dacă fiecare request deschide o conexiune proprie, la 100 de utilizatori simultani baza refuză conexiuni noi: *"too many clients already"*. Serverul de aplicație pare sănătos, dar tot ce atinge DB-ul eșuează.

## Cum dimensionezi

Regula practică pentru muncă predominant CPU pe DB:

```
pool_size ≈ (nuclee DB × 2) + spindles
```

Pentru un Postgres cu 4 nuclee: **~10 conexiuni**, nu 100. Contraintuitiv, dar un pool mai mic e adesea mai rapid: 100 de interogări care se luptă pe 4 nuclee sunt mai lente decât 10 care se execută în ordine.

**Atenție la înmulțire:** `pool_size` e per instanță de aplicație. 5 containere × pool 20 = 100 de conexiuni către DB. Numărul care contează la `max_connections` e produsul.

## Când ai nevoie de pgBouncer

Cu multe instanțe (serverless, autoscaling agresiv), un pooler extern în mod `transaction` multiplexează mii de clienți pe câteva zeci de conexiuni reale.

Limitare de reținut: în mod `transaction` nu poți folosi prepared statements de sesiune, `SET` de sesiune sau `LISTEN/NOTIFY`. Unele ORM-uri trebuie configurate special.

## Capcane

- **Conexiuni care nu se întorc în pool.** O excepție pe o cale fără `finally`/context manager scurge o conexiune. După N erori, pool-ul e gol și aplicația îngheață — nu crapă, îngheață, care e mai greu de diagnosticat.
- Tranzacții lungi țin conexiunea ocupată. Vezi [[Tranzactii si nivele de izolare]].
- `pool_timeout` prea mare ascunde problema: cererile se aliniază la coadă și utilizatorul vede lentoare, nu eroare. Mai bine eșuează repede.
- Loghează utilizarea pool-ului. „Pool epuizat" trebuie să fie o alertă, nu o descoperire.

## Legături

- Face parte din: [[MOC Baze de date]] · [[MOC Backend si API]]
- [[Python async - model mental]] — driver async, pool async
- [[Observability - logs metrics traces]] · [[Health checks]]
