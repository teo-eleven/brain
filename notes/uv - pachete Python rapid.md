---
tags: [note, ai, unelte]
created: 2026-08-11
type: note
status: schelet
---

# uv - pachete Python rapid

## Ce e

Manager de pachete și de proiecte Python scris în Rust. Înlocuiește dintr-o dată
`pip`, `venv`, `pip-tools`, `poetry` și `pyenv` — cu ordine de mărime mai rapid
la rezolvarea dependențelor.

Modelul de lucru:

- **`pyproject.toml`** — ce vrei: dependențe cu constrângeri largi.
- **`uv.lock`** — ce ai primit: versiuni exacte, hash-uri, pentru toate
  platformele. **Se versionează în git.** Fără el, „merge la mine" e garantat.
- **`.venv/`** — mediul, creat automat. Nu-l activezi manual dacă folosești
  `uv run`.

Distincția care contează: `uv sync` aduce mediul **la starea din lock**, inclusiv
ștergând ce nu mai e acolo. `uv add` schimbă și `pyproject.toml`, și lock-ul, și
mediul. `uv lock --upgrade` e singurul mod în care versiunile urcă — restul sunt
deterministe.

În Docker: `uv sync --frozen` refuză să regenereze lock-ul. Dacă lock-ul nu se
potrivește cu `pyproject.toml`, build-ul cade — exact ce vrei într-un pipeline.

## Unde apare la mine

`qa-ai-agent` e integral pe uv: `pyproject.toml` + `uv.lock` la rădăcină. Tot ce
rulez în harness trece prin `uv run` — DeepEval, generatoarele de dataset,
jobul de scoring. Nu activez venv-uri manual, deci nu am starea aia ambiguă în
care nu mai știi ce interpretor e activ.

`ecf_app_web-doc_extract_studio` e încă pe requirements + pip, în containere.
Diferența se simte: în harness adaug o dependență în două secunde.

## Comenzi

```bash
uv sync                      # mediul = lock-ul, exact
uv sync --frozen             # în Docker/CI: nu regenera lock-ul, crapă dacă diferă
uv add deepeval              # dependență runtime
uv add --dev pytest ruff     # dependență de dezvoltare
uv run python -m evals.deepeval.score_job   # rulează fără să activezi venv
uv lock --upgrade            # ridică versiunile, controlat
uv lock --upgrade-package langfuse          # ridică una singură
uv python install 3.12       # și interpretorul, tot prin uv
```

## De reținut

Nu amesteca `pip install` cu uv în același proiect — pip nu știe de lock și
mediul devine o minciună față de `uv.lock`.

## De răspuns

- Merită mutat și `ecf_app_web-doc_extract_studio` pe uv, sau containerele fac
  câștigul irelevant?
- Am `uv sync --frozen` în CI, sau pipeline-ul regenerează lock-ul tăcut?
- Grupurile de dependențe (dev / evals / generators) sunt separate sau totul e
  într-o singură listă?
- Cât de des rulez `uv lock --upgrade` și cine verifică că evaluările încă trec
  după upgrade?

## Cum învăț asta

**Documentație:** https://docs.astral.sh/uv

**Primul pas practic** (30 de minute):

1. `uv init test-uv && cd test-uv` — apar `pyproject.toml`, `.python-version`, `main.py`.
2. `uv add httpx` și uită-te ce s-a schimbat: `uv.lock` apare, `.venv/` se creează singur.
3. `uv run main.py` rulează fără activare de venv; compară cu `python -m venv .venv2 && .venv2/Scripts/pip install httpx` cronometrat — diferența se vede din prima.

**Ordinea în care merită citit:**

| Etapă | Ce                                           | De ce în ordinea asta                                    |
| ----- | -------------------------------------------- | -------------------------------------------------------- |
| 1     | `uv init` / `uv add` / `uv run`              | Bucla zilnică; acoperă 90% din utilizare                 |
| 2     | `uv.lock` vs `uv sync`                       | Aici se naște reproductibilitatea, și tot aici se pierde |
| 3     | `--frozen`, grupuri dev, `uv python install` | CI și Docker au nevoie de ele, dar abia după bază        |

**Capcana de începător:** activezi venv-ul manual și dai `pip install` peste un proiect uv — pachetul intră în mediu dar nu în `uv.lock`, iar la următorul `uv sync` dispare fără avertisment și codul crapă în CI.

## Legat

- [[Docker Compose - stack local]]
- [[QA AI Agent]]
- [[Lucrul cu agenti in terminal]]
- [[MOC Operatii zilnice]]
