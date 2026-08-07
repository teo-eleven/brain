---
tags: [security, crypto]
created: 2026-08-06
type: permanent
---

# Hashing parole

## Regula

**bcrypt, scrypt sau Argon2id. Niciodată MD5, SHA1, SHA256.**

## De ce SHA nu e potrivit

SHA e proiectat să fie **rapid** — asta e o virtute pentru verificarea integrității fișierelor și un defect fatal pentru parole. Un GPU calculează miliarde de SHA256 pe secundă. O bază de parole hash-uite cu SHA256 se sparge la scară în ore.

Algoritmii de parole sunt proiectați să fie **lenți și greu de paralelizat**, cu un factor de cost ajustabil pe care îl crești pe măsură ce hardware-ul devine mai rapid.

## Salt

Un șir aleator, unic **per utilizator**, adăugat înainte de hash. Împiedică:
- rainbow tables (hash-uri precalculate)
- identificarea utilizatorilor cu aceeași parolă din simpla comparare a hash-urilor

Saltul **nu e secret** și se stochează lângă hash. bcrypt și Argon2 îl generează și îl includ automat în string-ul rezultat — nu trebuie să-l gestionezi tu.

## În practică

```python
from argon2 import PasswordHasher
ph = PasswordHasher()

hash = ph.hash(parola)              # la înregistrare
ph.verify(hash, parola_introdusa)   # la login, aruncă excepție dacă nu
```

Cu bcrypt, atenție la limita de **72 de bytes** — parolele mai lungi sunt trunchiate silențios. Argon2id nu are limitarea asta și e recomandarea actuală OWASP.

## Ce mai contează la login

- **Rate limiting agresiv** pe endpoint-ul de login — 5 încercări/minut. Vezi [[Rate limiting]].
- **Mesaj de eroare identic** pentru „email inexistent" și „parolă greșită". Altfel enumerezi conturi.
- **Timp de răspuns similar** în ambele cazuri — dacă emailul inexistent răspunde în 5 ms și cel existent în 300 ms (timpul de verificare a hash-ului), diferența e măsurabilă. Hash-uiește un dummy chiar și când utilizatorul nu există.
- Verifică parola împotriva listelor de parole scurse (Have I Been Pwned API, cu k-anonymity) în loc de reguli arbitrare de complexitate.
- MFA bate orice politică de parole.

## Ce NU faci

- Nu limita lungimea maximă (sub 64+ caractere)
- Nu interzice caractere speciale sau spații
- Nu forța schimbarea periodică fără motiv — duce la `Parola1!`, `Parola2!`
- Nu trimite parola pe email, niciodată
- Nu loga parola, nici în debug, nici temporar. Vezi [[Observability - logs metrics traces]].

## Legături

- Face parte din: [[MOC Securitate]]
- [[Autentificare vs autorizare]] · [[JWT - ce e si ce nu e]]
- [[OWASP Top 10 - pe scurt]] · [[Rate limiting]]
