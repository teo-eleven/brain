---
tags: [note, workflow]
created: 2026-08-11
type: note
status: schelet
---

# Claude Code - configurare

Ce stă unde în `~/.claude/` și de ce. Nota de utilizare, nu de instalare.

## `~/.claude/CLAUDE.md`

Se încarcă la **fiecare** sesiune. Deci fiecare linie costă tokeni permanent, în
toate proiectele, la toate promptul-urile.

Consecință practică: aici intră doar regulile care contează întotdeauna. Scurt,
imperativ, fără explicații lungi. Restul se mută în `rules/`.

## `~/.claude/rules/`

Fișiere citite **la cerere**, nu automat. Aici țin detaliile: workflow de git,
standarde de review, convenții de testare, stil de cod. `CLAUDE.md` doar
trimite spre ele.

Avantaj: pot avea reguli lungi fără să plătesc pentru ele în fiecare sesiune.

## `~/.claude/settings.json`

Configurare + **hooks**. Astea sunt mecanismul, nu promisiunea (vezi
[[Lucrul cu agenti in terminal]]).

- `PreToolUse` — rulează înainte de o unealtă. Bun pentru blocare / validare.
- `PostToolUse` — rulează după. Bun pentru formatare, lint, indexare, log.
- `matcher` — pe ce unealtă se declanșează (de exemplu doar pe `Edit`/`Write`,
  sau doar pe `Bash`).

Un hook primește **JSON pe stdin**, cu `tool_name` și `tool_input`. Deci hook-ul
trebuie să citească stdin și să parseze JSON — nu primește argumente pe linia de
comandă. Ce scrie la ieșire și codul de retur decid dacă acțiunea continuă.

Reguli de igienă pentru hooks:

- rapid: rulează des, orice secundă în plus se simte;
- idempotent: se poate declanșa de mai multe ori pe același fișier;
- tăcut când reușește, explicit când cade;
- căi absolute, pentru că directorul curent nu e garantat.

## `~/.claude/agents/`

Agenți cu scop îngust: `planner`, `code-reviewer`, `security-reviewer`,
`tdd-guide`, `debugger`. Fiecare are propriul prompt și propriile unelte.

Atenție la permisiuni: un agent cu Bash poate scrie în git. Dacă nu vreau, o
interzic în promptul lui.

## Skill-uri

Instrucțiuni împachetate pentru un tip de sarcină, invocate când se potrivește
contextul. Diferența față de un agent: skill-ul se încarcă în sesiunea curentă,
agentul rulează separat, cu context propriu.

## Conectori MCP

Microsoft 365, GitHub, Context7. Extind accesul agentului la date reale. Două
lucruri de ținut minte:

- ce citesc de acolo e input neîncrezut → [[Prompt injection - aparare]];
- ce pot scrie acolo e efect în lumea reală → cer confirmare.

Detalii de protocol în [[MCP - Model Context Protocol]].

## Ordinea în care schimb ceva

1. Regula e universală? → `CLAUDE.md`, o linie.
2. E detaliu? → `rules/`, cu link din `CLAUDE.md`.
3. Trebuie să se întâmple automat? → hook în `settings.json`.
4. E o sarcină repetabilă cu context propriu? → agent sau skill.

## De răspuns

- Ce linii din `CLAUDE.md` actual nu se aplică chiar la orice proiect?
- Ce hook-uri `PostToolUse` am și ce fac ele exact la fiecare rulare?
- Care agenți au Bash și au voie să scrie în git, intenționat?
- Cum testez un hook fără să declanșez o sesiune întreagă?
- Ce configurare e globală și ce ar trebui mutată per-proiect?

Legături: [[MOC AI Engineer]], [[MOC Operatii zilnice]], [[MOC Stack AI]]
