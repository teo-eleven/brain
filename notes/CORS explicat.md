---
tags: [security, frontend, http]
created: 2026-08-06
type: permanent
---

# CORS explicat

## Ideea

CORS nu e un mecanism care îți protejează serverul. E un mecanism prin care **serverul tău dă permisiune browserului** să lase un JavaScript de pe alt origin să citească răspunsul.

Restricția e impusă de **browser**, nu de server. `curl`, Postman și orice script de pe server ignoră CORS complet — nu există.

## Consecința pe care lumea o ratează

Un CORS restrictiv **nu** e protecție contra atacatorilor. Atacatorul nu folosește browser. CORS protejează **utilizatorii tăi** de site-uri terțe care ar vrea să le citească datele folosind sesiunea lor.

Deci: CORS nu înlocuiește niciodată autentificarea și autorizarea. Vezi [[Autentificare vs autorizare]].

## Cum funcționează

**Cerere simplă** (GET, POST cu content-type de formular): browserul o trimite, apoi verifică `Access-Control-Allow-Origin` în răspuns. Dacă nu se potrivește, **blochează citirea răspunsului** — dar cererea a ajuns deja la server și a avut efect. Important pentru operațiuni cu efecte secundare.

**Preflight** (PUT, DELETE, `Content-Type: application/json`, headere custom): browserul trimite întâi un `OPTIONS`:

```
OPTIONS /facturi
Origin: https://app.exemplu.ro
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type, authorization
```

Serverul răspunde ce permite:
```
Access-Control-Allow-Origin: https://app.exemplu.ro
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: content-type, authorization
Access-Control-Max-Age: 86400
```

`Max-Age` cachează preflight-ul — fără el, fiecare cerere devine două.

## Erori tipice

| Simptom | Cauza |
|---|---|
| „No 'Access-Control-Allow-Origin' header" | serverul nu trimite headerul (sau a răspuns 500 și n-a ajuns la middleware) |
| Merge în Postman, nu în browser | normal — CORS e doar în browser |
| Cookie-urile nu se trimit | ai nevoie de `credentials: "include"` pe client **și** `Access-Control-Allow-Credentials: true` pe server |
| „Wildcard not allowed with credentials" | cu credentials, `*` e interzis — trebuie origin explicit |

## Reguli

- **Nu folosi `Access-Control-Allow-Origin: *`** pe API-uri autenticate. Pentru un API public de citire e acceptabil.
- Nu reflecta orbește headerul `Origin` primit în răspuns — echivalent cu `*`, dar și cu credentials permise.
- Listă albă explicită de origini, din configurare, diferită pe medii.

## Legături

- Face parte din: [[MOC Securitate]] · [[MOC Backend si API]]
- [[Autentificare vs autorizare]] · [[XSS]]
- [[HTTP status codes care conteaza]]
