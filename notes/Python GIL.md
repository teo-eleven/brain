---
tags: [python, performance]
created: 2026-08-06
type: permanent
---

# Python GIL

## Ideea

GIL (Global Interpreter Lock) = un lacăt care permite **unui singur thread să execute bytecode Python la un moment dat**. Ai 8 nuclee, dar codul Python pur rulează pe unul.

## De ce contează

Determină ce unealtă alegi:

| Problema ta | Soluția | De ce |
|---|---|---|
| Aștepți rețea / DB / disc | `asyncio` sau threads | GIL se eliberează în timpul I/O |
| Calculezi (parsare, imagini, criptare) | `multiprocessing` | procese separate = GIL-uri separate |
| Numeric greu | numpy / polars | eliberează GIL în C |

Regula scurtă: **threading pentru așteptare, multiprocessing pentru calcul.**

## Exemplu

Un endpoint care generează un PDF de 200 de pagini într-un `async def` va bloca toți ceilalți utilizatori pe durata generării. Soluția nu e „mai mult async", e să scoți munca din request: [[Cozi si background jobs]].

## Capcane

- Oamenii pun `async` peste tot crezând că e „modul rapid". Vezi [[Python async - model mental]].
- Python 3.13 are un build experimental fără GIL (`--disable-gil`). Nu e default și ecosistemul de librării C nu e pregătit. Nu construiește nimic pe presupunerea că GIL a dispărut.
- `multiprocessing` nu e gratis: costul e serializarea datelor între procese. Pentru sarcini mici, overhead-ul depășește câștigul.

## Legături

- Face parte din: [[MOC Python]]
- [[Python async - model mental]]
- [[Cozi si background jobs]]
