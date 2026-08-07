---
tags: [security, devops]
created: 2026-08-06
type: permanent
---

# Secrets management

## Regula

Un secret nu intră **niciodată** în: cod, git, imagine Docker, log, mesaj de eroare, ticket, screenshot, chat.

Vine din **environment** sau dintr-un secret manager, la runtime.

## Ierarhia, de la acceptabil la bun

1. `.env` local + `.env` în `.gitignore`, cu un `.env.example` comis (doar chei, fără valori) — minimul pentru un proiect personal
2. Variabile de environment injectate de platformă (CI/CD secrets, Docker secrets)
3. Secret manager (Vault, AWS Secrets Manager, Azure Key Vault) cu rotație

Pentru proiectele tale, nivelul 1-2 e suficient. Nivelul 3 când ai echipă și conformitate.

## Dacă un secret a ajuns în git

**Rotația e obligatorie, ștergerea nu e suficientă.** Ordinea:

1. **Invalidează cheia** la furnizor, imediat. Ăsta e singurul pas care contează.
2. Generează una nouă.
3. Abia apoi curăță istoricul (`git filter-repo`) — dar presupune că cine a avut acces la repo are cheia.

Un `git rm` + commit **nu** șterge nimic: cheia rămâne în istoric, în fork-uri, în cache-ul GitHub, în clone-urile locale ale colegilor.

## Ce previne accidentul

- `.gitignore` cu `.env`, `*.pem`, `*.key`, `credentials.json` — **înainte** de primul commit
- Hook de pre-commit cu scanner de secrete (`gitleaks`, `detect-secrets`)
- Scanare în CI pe fiecare PR
- Review care se uită explicit după string-uri lungi și base64

## Capcane specifice

- **Frontend: orice variabilă prefixată `NEXT_PUBLIC_` / `VITE_` ajunge în browser.** Nu pui niciodată un secret acolo. Vezi [[Server components vs client components]].
- **Docker: `ARG` și `ENV` rămân în istoricul imaginii.** Cine trage imaginea le poate citi cu `docker history`. Pentru secrete la build, `--mount=type=secret`. Vezi [[Docker layer caching]].
- **Logurile de excepție** includ adesea variabile locale sau URL-uri complete cu token în query string. Vezi [[Observability - logs metrics traces]].
- Un secret partajat între dev și prod înseamnă că un laptop compromis compromite producția. Chei separate per mediu, mereu.

## Legături

- Face parte din: [[MOC Securitate]] · [[MOC DevOps si Deploy]]
- [[12 factor app]] · [[OWASP Top 10 - pe scurt]]
