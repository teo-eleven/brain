---
tags: [project]
created: 2026-08-10
type: project
status: active
---

# Inventory Pro

> **Status:** active · **Repo:** `Econfaire/ecf-inventory-management` · **Branch:** `dev`

> [!note] Nota generata din cod pe 2026-08-10
> Stack-ul si comenzile sunt citite din `CLAUDE.md` si din `package.json`-uri, deci sunt corecte.
> Ce lipseste e contextul pe care doar tu il ai: pentru cine e, ce urmeaza, ce te-a durut.
> Completeaza sectiunile goale — vezi [[MOC Vault - cum functioneaza]].

## Într-o propoziție

<!-- Ce face și pentru cine. Gestiune de inventar / echipamente la Econfaire. -->

## Stack

- **Frontend:** Next.js 15 cu Turbopack, React, `next-intl` (multilingv), Tailwind + Headless UI
  - `@dnd-kit` (drag & drop), `@tanstack/react-virtual` (liste lungi), `framer-motion`, `lucide-react`
- **Backend:** Express + TypeScript, rulat cu `tsx watch` în dev
  - `jsonwebtoken` + `bcrypt` (auth), `multer` (upload), `nodemailer` (mail)
  - `exceljs` + `docxtemplater` (exporturi Excel / Word)
- **DB:** PostgreSQL 15 prin Prisma
- **Infra:** Docker Compose, cu variantă separată pentru NGINX reverse proxy

## Unde e codul

- Local: `D:\teodor.fotciuc\ecf-inventory-management`
- Date Postgres: `D:\teodor.fotciuc\pgdata-ecf-inventory`
- Repo remote: https://github.com/Econfaire/ecf-inventory-management
- Deploy:

## Starea actuală

<!-- Actualizat: 2026-08-10 -->

Ultimul commit pe `dev` e din **28 aprilie 2026** (`567f3e2`, categorii ca multi-select
căutabil, PR #3), făcut de un coleg. Istoricul recent e al altora — eu nu am commit-uri
aici încă.

## Următorii pași

- [ ]

## Comenzi utile

```powershell
# frontend (port 3000)
cd frontend; npm run dev

# backend (hot reload)
cd backend; npm run dev

# baza de date
cd backend; npx prisma studio          # browser vizual
cd backend; npx prisma migrate dev     # migrare noua

# tot stack-ul
docker compose up -d
docker compose -f docker-compose.nginx.yml up -d   # cu NGINX
```

## Decizii luate

-

## Probleme cunoscute

- **Nu există framework de teste** și nici ESLint/Prettier configurate (scrie explicit în
  `CLAUDE.md`-ul repo-ului). Asta intră în conflict direct cu regula mea de 80% coverage —
  vezi [[Piramida testelor]] și [[TDD - red green refactor]].

## Note legate

- [[MOC Backend si API]] · [[MOC Baze de date]] · [[MOC DevOps si Deploy]] · [[MOC Testare]]
