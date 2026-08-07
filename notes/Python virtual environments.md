---
tags: [python, tooling]
created: 2026-08-06
type: permanent
---

# Python virtual environments

## Ideea

Un venv e un folder cu propriul Python și propriile pachete. Fiecare proiect are unul. Nimic nu se instalează global, niciodată.

## De ce contează

Fără venv: proiectul A vrea `pydantic 1.x`, proiectul B vrea `2.x`. Instalezi pentru B, se rupe A. Debug-ul durează o oră și concluzia e „am instalat global".

## Comenzi (Windows / PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# ce am instalat de fapt
pip freeze > requirements.txt
```

Dacă activarea dă eroare de politică de execuție:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## Regula practică

`.venv/` **în `.gitignore`**, mereu. Se recreează din `requirements.txt` / `pyproject.toml` în 30 de secunde; e sute de MB și e specific sistemului.

## Alternative moderne

- **uv** — instalator scris în Rust, 10-100× mai rapid ca pip, gestionează și venv-ul. Merită trecut la el.
- **Poetry / PDM** — management de dependențe cu lockfile.
- `requirements.txt` + pip e încă perfect valid pentru proiecte mici; nu e „învechit", e doar minimal.

## Capcane

- Venv activat într-un terminal ≠ activat în toate. Fiecare terminal nou trebuie activat.
- VS Code / PyCharm trebuie să știe de interpretor (`Ctrl+Shift+P` → *Python: Select Interpreter*), altfel rulează cu alt Python decât cel din terminal.
- `pip freeze` scrie și dependențele dependențelor — bine pentru reproductibilitate, urât pentru citit. `pyproject.toml` separă cele două.

## Legături

- Face parte din: [[MOC Python]]
- Echivalentul izolării la deploy: [[Docker layer caching]]
- [[12 factor app]] — dependențe declarate explicit
