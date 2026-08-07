---
tags: [devops, backend]
created: 2026-08-06
type: permanent
---

# Health checks

## Ideea

Două întrebări diferite, două endpoint-uri diferite:

- **Liveness** — „ești viu?" Dacă nu, **restartează-mă**.
- **Readiness** — „poți primi trafic?" Dacă nu, **scoate-mă din load balancer** (dar nu mă omorî).

Confuzia dintre ele produce incidente.

## De ce distincția contează

Scenariu real: baza de date e temporar indisponibilă.

- Dacă **liveness** verifică DB-ul → orchestratorul crede că aplicația e moartă și o restartează. La restart, DB-ul e tot jos. Restart loop infinit, pe toate instanțele simultan. Ai transformat o problemă de DB într-o pană totală.
- Corect: **readiness** verifică DB-ul (nu primesc trafic cât nu pot servi), **liveness** verifică doar că procesul răspunde.

## Ce verifică fiecare

```
GET /healthz   (liveness)
→ 200, corp gol. Verifică DOAR că procesul răspunde.
   Fără DB, fără Redis, fără apeluri externe.

GET /readyz    (readiness)
→ verifică dependențele CRITICE: DB (SELECT 1), migrări aplicate,
   cache pornit. Cu timeout scurt (1-2 s).
```

## Reguli

- **Fără autentificare** pe health checks, dar fără informații sensibile în răspuns. Nu expune versiuni de librării, string-uri de conexiune sau stack traces.
- **Rapide.** Un readiness care durează 5 secunde va da timeout la orchestrator și te scoate din trafic degeaba.
- **Excludeți din [[Rate limiting]]** — altfel orchestratorul primește 429 și crede că ai murit.
- Verifică doar dependențele **critice**. Dacă un serviciu de email e jos, aplicația poate încă servi 90% din funcționalitate — nu te scoate din trafic pentru asta.
- Graceful shutdown: la `SIGTERM`, întorci readiness fals, aștepți cererile în curs, apoi ieși. Fără asta, fiecare deploy taie conexiuni active.

## Capcane

- Un health check care verifică toate dependențele tranzitiv creează **eșecuri în cascadă**: un serviciu terț jos scoate din trafic toată flota.
- Nu confunda health check cu monitorizare. Health check-ul e pentru orchestrator (binar); monitorizarea e pentru tine (metrici) — vezi [[Observability - logs metrics traces]].

## Legături

- Face parte din: [[MOC DevOps si Deploy]] · [[MOC Backend si API]]
- [[Strategii de deploy]] · [[12 factor app]] · [[Connection pooling]]
