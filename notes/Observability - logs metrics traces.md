---
tags: [devops, monitoring]
created: 2026-08-06
type: permanent
---

# Observability - logs metrics traces

## Ideea

Trei semnale, trei întrebări diferite:

| Semnal | Răspunde la | Cost | Cardinalitate |
|---|---|---|---|
| **Metrici** | *cât / câte* — e o problemă? | mic | mică (agregat) |
| **Trace-uri** | *unde* — care pas e lent? | mediu (sampled) | mare |
| **Loguri** | *de ce* — ce s-a întâmplat exact | mare | nelimitată |

Fluxul normal de investigație: metrica alertează → trace-ul localizează → logul explică.

## Loguri structurate, nu text

```python
# Inutil la scară
log.info(f"Factura {id} procesată în {ms}ms")

# Interogabil
log.info("factura_procesata", extra={
    "factura_id": id, "durata_ms": ms,
    "tenant_id": tenant, "request_id": rid,
})
```

Cu text simplu nu poți răspunde la „câte facturi peste 500 ms, pe tenant". Cu JSON, e o interogare.

**`request_id` propagat prin tot** e cel mai valoros câmp din sistem. Fără el nu poți lega logurile unei singure cereri care a trecut prin 4 servicii.

## Ce metrici merită de la început

Cele patru „golden signals":

1. **Latență** — și mereu percentile (p50, p95, p99), **nu media**. Media ascunde exact cazurile care supără utilizatorii.
2. **Trafic** — cereri/secundă
3. **Erori** — rata de 5xx, și separat 4xx
4. **Saturație** — CPU, memorie, pool de conexiuni ([[Connection pooling]])

## Reguli

- **Nu loga date sensibile.** Parole, tokenuri, CNP, numere de card. Logurile ajung în sisteme cu acces larg. Vezi [[Secrets management]].
- **Nu loga în buclă.** Un `log.info` per element × 100.000 de elemente = costuri de logging mai mari decât serverul.
- Nivele consecvente: `ERROR` = cineva trebuie să se uite; `WARN` = ciudat, dar am continuat; `INFO` = evenimente de business; `DEBUG` = dezvoltare.
- **Alertează pe simptome, nu pe cauze.** „p99 > 2s" e util. „CPU > 80%" te trezește la 3 noaptea degeaba.

## Capcane

- **Cardinalitate mare în etichete de metrici** (user_id, request_id) explodează costul și poate doborî sistemul de monitorizare. Alea aparțin în loguri, nu în metrici.
- Loguri fără retenție definită = factură care crește la infinit.
- Un dashboard pe care nu se uită nimeni nu e observabilitate. Alertele sunt partea utilă.

## Legături

- Face parte din: [[MOC DevOps si Deploy]]
- [[Health checks]] · [[Strategii de deploy]] · [[12 factor app]]
- [[Debugging metodic]] · [[N+1 query problem]] — un trace îl arată instant
