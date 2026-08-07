---
tags: [python, testing, ref]
created: 2026-08-06
type: cheatsheet
---

# pytest cheatsheet

## Rulare

```bash
pytest                              # tot
pytest tests/test_facturi.py        # un fișier
pytest tests/test_f.py::test_total  # un singur test
pytest -k "tva and not integrare"   # după nume, cu expresii
pytest -m "slow"                    # după marker
pytest -x                           # oprește la primul eșec
pytest --lf                         # doar cele care au eșuat ultima dată
pytest --ff                         # cele eșuate primele, apoi restul
pytest -q                           # output scurt
pytest -vv                          # verbose, diff-uri complete
pytest -s                           # nu captura print-urile
pytest --durations=10               # cele mai lente 10 teste
pytest -n auto                      # paralel (necesită pytest-xdist)
```

`--lf` și `-x` împreună sunt bucla de lucru normală când repari ceva.

## Structura de bază

```python
def test_calculeaza_tva_standard():
    # Arrange
    factura = Factura(valoare=Decimal("100"))
    # Act
    tva = calculeaza_tva(factura)
    # Assert
    assert tva == Decimal("19")
```

Nume descriptiv de comportament, nu `test_1`.

## Excepții

```python
import pytest

def test_valoare_negativa_arunca():
    with pytest.raises(ValueError, match="valoare.*negativ"):
        Factura(valoare=Decimal("-1"))

# și verificarea excepției
with pytest.raises(HTTPException) as ei:
    ...
assert ei.value.status_code == 404
```

`match` e regex pe mesaj — previne trecerea testului din alt motiv decât cel așteptat.

## Parametrizare

```python
@pytest.mark.parametrize("valoare,tva", [
    (Decimal("100"), Decimal("19")),
    (Decimal("0"),   Decimal("0")),
    (Decimal("0.01"), Decimal("0")),      # rotunjire
])
def test_tva(valoare, tva):
    assert calculeaza_tva(valoare) == tva

# id-uri lizibile în output
@pytest.mark.parametrize("input,expected", [...], ids=["normal", "zero", "rotunjire"])
```

## Fixtures

```python
@pytest.fixture
def db():
    conn = create_test_db()
    yield conn                    # tot ce e după yield = teardown
    conn.rollback(); conn.close()

@pytest.fixture(scope="session")  # function (default) | class | module | session
def app():
    return create_app(testing=True)

def test_ceva(db, app):           # injectate prin nume
    ...
```

`conftest.py` = fixtures partajate, disponibile automat în tot folderul și subfolderele. Nu se importă.

## Fixtures utile din pytest

```python
def test_fisier(tmp_path):              # folder temporar, curățat automat
    (tmp_path / "a.txt").write_text("x")

def test_env(monkeypatch):
    monkeypatch.setenv("API_KEY", "test")
    monkeypatch.setattr("modul.functie", lambda: 42)
    monkeypatch.chdir(tmp_path)

def test_log(caplog):
    ...
    assert "eroare" in caplog.text

def test_print(capsys):
    out, err = capsys.readouterr()
```

`monkeypatch` se anulează automat la finalul testului — de asta e preferabil față de patch manual.

## Markere

```python
@pytest.mark.slow
@pytest.mark.skip(reason="nu e implementat")
@pytest.mark.skipif(sys.platform == "win32", reason="doar Linux")
@pytest.mark.xfail(reason="bug cunoscut #142")     # eșec așteptat
```

`xfail` e mai bun decât `skip` pentru un bug cunoscut: dacă începe să treacă, pytest te anunță (`XPASS`).

Declară markerele în `pyproject.toml`, altfel primești warning:
```toml
[tool.pytest.ini_options]
markers = ["slow: teste lente", "integrare: necesită DB"]
addopts = "-q --strict-markers"
```

## Async

```python
# necesită pytest-asyncio
@pytest.mark.asyncio
async def test_endpoint(client):
    r = await client.get("/facturi")
    assert r.status_code == 200
```

## Coverage

```bash
pytest --cov=app --cov-report=term-missing
pytest --cov=app --cov-report=html          # htmlcov/index.html
pytest --cov=app --cov-fail-under=80
```

`term-missing` arată **liniile** neacoperite — singura parte utilă. Vezi [[Coverage - metrica utila si capcana]].

## Legături

- [[MOC Testare]] · [[MOC Python]]
- [[TDD - red green refactor]] · [[Test doubles - mock stub fake spy]] · [[Ce nu merita testat]]
