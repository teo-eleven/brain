---
tags: [security]
created: 2026-08-06
type: permanent
---

# OWASP Top 10 - pe scurt

## Ideea

Lista celor 10 categorii de vulnerabilități web cele mai frecvente, actualizată periodic de OWASP. Nu e exhaustivă — e „unde se pierd cei mai mulți bani".

## Lista (ediția 2021), cu ce înseamnă practic

1. **Broken Access Control** — cel mai frecvent. Poți accesa `/facturi/999` care aparține altcuiva doar schimbând id-ul din URL. Vezi [[Autentificare vs autorizare]] și [[Multi-tenancy - patterns]].
2. **Cryptographic Failures** — parole cu SHA1, date sensibile în clar, HTTP în loc de HTTPS. Vezi [[Hashing parole]].
3. **Injection** — SQL, comenzi de shell, LDAP, XSS. Vezi [[SQL injection]] și [[XSS]].
4. **Insecure Design** — lipsa unui control care ar fi trebuit gândit din start (ex: fără limită la resetarea parolei).
5. **Security Misconfiguration** — debug activat în producție, credențiale default, buckets publice, mesaje de eroare cu stack trace.
6. **Vulnerable Components** — o dependență cu CVE cunoscut. Cel mai ieftin de prevenit: `npm audit` / `pip-audit` în CI.
7. **Auth Failures** — brute force nelimitat, sesiuni care nu expiră, tokenuri previzibile. Vezi [[Rate limiting]] și [[JWT - ce e si ce nu e]].
8. **Data Integrity Failures** — deserializare nesigură, update-uri nesemnate, pipeline CI compromis.
9. **Logging Failures** — nu detectezi atacul pentru că nu loghezi nimic util. Vezi [[Observability - logs metrics traces]].
10. **SSRF** — serverul tău face un request către un URL controlat de utilizator, ajungând la resurse interne (`http://169.254.169.254` pentru credențiale cloud).

## Cele care te lovesc pe tine, realist

Pentru un dezvoltator care construiește aplicații web de business, în ordinea probabilității:

1. **#1 Broken Access Control** — de departe. Un `WHERE tenant_id` uitat.
2. **#6 Componente vulnerabile** — pasiv, dar exploatat automat de scanere.
3. **#5 Misconfiguration** — `DEBUG=True` pe producție.
4. **#2 / #7** — autentificare făcută manual în loc de o librărie matură.

## Cum îl folosești practic

Nu ca lectură. Ca **checklist de review** pentru orice cod care atinge autentificare, input de utilizator, sau date de alt utilizator. Trei întrebări per PR:

- Cine poate apela asta, și am verificat că **are dreptul** pe acest obiect specific?
- Ce input vine din exterior și unde e validat?
- Ce se loghează, și conține ceva sensibil?

## Legături

- Face parte din: [[MOC Securitate]]
- [[SQL injection]] · [[XSS]] · [[Autentificare vs autorizare]] · [[Hashing parole]]
- [[Secrets management]] · [[Multi-tenancy - patterns]]
