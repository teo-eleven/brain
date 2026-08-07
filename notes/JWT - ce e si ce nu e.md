---
tags: [security, backend, auth]
created: 2026-08-06
type: permanent
---

# JWT - ce e si ce nu e

## Ce e

Un JSON semnat, în trei părți base64: `header.payload.signature`. Serverul verifică semnătura și are încredere în conținut **fără să întrebe baza de date**. Asta e singurul lui avantaj real: verificare fără stare.

## Ce NU e

**1. Nu e criptat.** E semnat. Oricine poate citi payload-ul: `atob(token.split('.')[1])` în consola browserului. **Nu pune date sensibile într-un JWT.**

**2. Nu poate fi revocat.** Un token valid rămâne valid până expiră. Nu poți face logout real, nu poți bloca un utilizator imediat. Dacă îți trebuie revocare, ai nevoie de o listă de blocare în DB/Redis — moment în care ai pierdut exact avantajul pentru care ai ales JWT.

**3. Nu e mai sigur decât o sesiune.** E doar fără stare. O sesiune cu cookie și Redis e mai simplă, revocabilă instant, și corectă pentru 90% din aplicații.

## Când JWT e alegerea bună

- Mai multe servicii care trebuie să valideze independent, fără să lovească un store central
- API consumat de clienți terți
- Token de scurtă durată (5-15 min) + refresh token stocat și revocabil în DB

Pentru un monolit cu utilizatori proprii: **sesiuni**. Alegerea JWT „by default" e cel mai frecvent overengineering din autentificare.

## Unde stochezi tokenul

| Locație | Risc |
|---|---|
| `localStorage` | orice [[XSS]] îl fură |
| Cookie `HttpOnly` + `Secure` + `SameSite` | JS nu-l poate citi — **preferabil** |

`HttpOnly` nu rezolvă XSS-ul, dar limitează dauna: atacatorul poate acționa în pagină, nu poate exfiltra tokenul pentru folosire ulterioară.

## Capcane de implementare

- **`alg: none`** — atac clasic: atacatorul schimbă algoritmul în „niciunul" și trimite un token nesemnat. Librăriile moderne blochează asta, dar **specifică explicit algoritmul așteptat** la verificare, niciodată „ce zice tokenul".
- **Confuzie RS256/HS256** — atacatorul trimite un token HS256 semnat cu cheia publică. Aceeași apărare: algoritm fixat.
- **Verifică `exp`.** Sună evident; există librării care nu o fac implicit.
- **`exp` lung** (zile) = un token furat e valabil zile. 15 minute + refresh.
- Nu implementa JWT manual. Folosește o librărie testată.

## Legături

- Face parte din: [[MOC Securitate]]
- [[Autentificare vs autorizare]] · [[XSS]] · [[Hashing parole]]
- [[OWASP Top 10 - pe scurt]] · [[Secrets management]] — cheia de semnare e un secret
