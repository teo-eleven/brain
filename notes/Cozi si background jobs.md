---
tags: [architecture, backend]
created: 2026-08-06
type: permanent
---

# Cozi si background jobs

## Ideea

Ce nu trebuie să se întâmple **înainte** să răspunzi utilizatorului, nu se întâmplă în request. Îl pui într-o coadă și un worker îl execută.

## Ce iese din request

- trimitere de email / SMS
- generare de PDF, rapoarte, export-uri
- procesare de imagini/video
- apeluri către API-uri externe lente
- sincronizări, reindexări
- orice care durează peste ~1 secundă

Beneficiul secundar, adesea mai important decât viteza: dacă serviciul de email e jos, utilizatorul tot își creează contul. Coada absoarbe eșecul temporar.

## Regula de aur

**Un job VA rula de două ori.** Retry după timeout, worker care moare după ce a terminat munca dar înainte de a confirma, redeploy la mijloc.

Livrarea „exactly once" nu există practic în sisteme distribuite. Ce ai e „at least once" + **jobs idempotente**. Vezi [[Idempotenta in API]].

```python
def trimite_factura(factura_id):
    f = db.get(Factura, factura_id)
    if f.email_trimis_la:          # deja făcut, ieșim curat
        return
    send_email(f)
    f.email_trimis_la = now()
    db.commit()
```

## Ce trebuie să existe

- **Retry cu backoff exponențial** — nu retry imediat în buclă. Vezi [[Retry cu backoff exponential]].
- **Dead letter queue** — după N eșecuri, jobul merge într-o coadă separată pentru inspecție umană. Fără DLQ, jobul eșuat fie se pierde, fie retrimite la infinit.
- **Payload mic: doar ID-uri, nu obiecte.** Workerul citește starea actuală din DB. Un obiect serializat în coadă e o poză învechită, și rupe compatibilitatea la deploy.
- **Timeout per job** — un job blocat ocupă un worker la infinit.
- **Monitorizare a adâncimii cozii.** O coadă care crește constant = workeri insuficienți sau joburi care eșuează în buclă. Alertă. Vezi [[Observability - logs metrics traces]].

## Capcane

- **Job pus în coadă înaintea commit-ului tranzacției.** Workerul rapid citește datele înainte să existe. Publică **după** commit (sau folosește pattern-ul outbox: scrii jobul în DB în aceeași tranzacție, un proces separat îl publică). Vezi [[Tranzactii si nivele de izolare]].
- **Ordinea nu e garantată** în majoritatea cozilor. Nu presupune că jobul A rulează înaintea lui B.
- **Compatibilitate la deploy**: joburi puse de codul nou, consumate de workeri vechi. Vezi [[Strategii de deploy]].
- Un cron care rulează pe fiecare instanță = execuție multiplă. Necesită lock distribuit.

## Unelte

Celery / RQ / Dramatiq (Python), BullMQ (Node), sau — perfect valid pentru început — **un tabel în Postgres** cu `SELECT ... FOR UPDATE SKIP LOCKED`. Nu ai nevoie de Kafka pentru 100 de emailuri pe zi.

## Legături

- Face parte din: [[MOC Arhitectura]] · [[MOC Backend si API]]
- [[Idempotenta in API]] · [[Retry cu backoff exponential]]
- [[Event driven - baza]] · [[Python GIL]] — de ce munca grea iese din proces
