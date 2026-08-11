---
tags: [note, python, unelte]
created: 2026-08-11
type: note
status: schelet
---

# uv — pachete Python, rapid

> [!warning] Schelet — completează-l când îl folosești în profunzime

## Ce e

Manager de pachete și de mediu pentru Python, scris în Rust. Înlocuiește `pip` + `venv` +
`pip-tools`, și în bună parte `poetry`. Rezolvarea dependințelor e cu un ordin de mărime mai
rapidă.

Lucrează cu `pyproject.toml` (declarativ) și `uv.lock` (blocat, reproductibil). Fișierul lock
**se versionează** — el garantează că altcineva instalează exact aceleași versiuni.

## Unde îl folosești

`qa-ai-agent` — `pyproject.toml` + `uv.lock`. Harness-ul QA e construit pe el.

## Comenzi de zi cu zi

```bash
uv sync                    # instaleaza exact ce scrie in uv.lock
uv add pyyaml              # adauga dependinta + actualizeaza lock-ul
uv add --dev pytest        # dependinta doar de dezvoltare
uv run <comanda>           # ruleaza in mediul proiectului, fara activare manuala
uv lock --upgrade          # reimprospateaza versiunile
```

## De răspuns

- `uv run` vs activarea clasică a venv-ului: ce se schimbă în obiceiul zilnic?
- Ce faci când un pachet nu are wheel și trebuie compilat?
- Cum coexistă cu Docker — instalezi în imagine cu `uv sync --frozen`?
- Când **nu** merită uv? (proiect vechi, tooling deja stabil pe poetry)

## Legat

- [[Python virtual environments]] — problema pe care o rezolvă
- [[Docker layer caching]] — lock-ul stabil face cache-ul util
- [[MOC Python]] · [[MOC Stack AI - unelte]]
