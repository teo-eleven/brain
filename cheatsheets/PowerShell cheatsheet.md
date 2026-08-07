---
tags: [powershell, windows, ref]
created: 2026-08-06
type: cheatsheet
---

# PowerShell cheatsheet

Pentru Windows. Diferențele față de bash sunt exact unde greșesc toți.

## Echivalențe bash → PowerShell

| bash | PowerShell |
|---|---|
| `ls -la` | `Get-ChildItem -Force` (alias `ls`) |
| `cat f` | `Get-Content f` |
| `head -20 f` | `Get-Content f -TotalCount 20` |
| `tail -f f` | `Get-Content f -Wait -Tail 20` |
| `grep x f` | `Select-String x f` |
| `which cmd` | `(Get-Command cmd).Source` |
| `wc -l f` | `(Get-Content f \| Measure-Object -Line).Lines` |
| `mkdir -p a/b` | `New-Item -ItemType Directory -Force a/b` |
| `rm -rf d` | `Remove-Item -Recurse -Force d` |
| `export X=1` | `$env:X = "1"` |
| `echo $X` | `$env:X` |
| `2>/dev/null` | `2>$null` |
| `touch f` | `New-Item -ItemType File f` |

## Capcane reale

**`&&` și `||` nu există în PowerShell 5.1** (Windows PowerShell). Folosește:
```powershell
comanda1; if ($?) { comanda2 }        # doar dacă a reușit
comanda1; comanda2                    # necondiționat
```
În PowerShell 7+ (`pwsh`) `&&` funcționează.

**Fără ternar / null-coalescing în 5.1.** `?:` și `??` sunt doar în 7+.

**`Set-Content` scrie ANSI implicit.** Pentru fișiere citite de alte tool-uri:
```powershell
Set-Content f.txt "text" -Encoding utf8
```

**Escape e backtick, nu backslash:** `` `n `` = newline, `` `t `` = tab.

**Executabile cu spații în cale** — call operator:
```powershell
& "C:\Program Files\App\app.exe" arg1
```

**Argumente care încep cu `-` sau `@`** — stop-parsing:
```powershell
git log --% --format=%H
```

## Filtre și pipeline

Pipeline-ul trece **obiecte**, nu text. Asta e diferența fundamentală:

```powershell
Get-Process | Where-Object CPU -gt 100 | Sort-Object CPU -Descending | Select-Object -First 5
Get-ChildItem -Recurse -Filter *.py | Measure-Object -Sum Length
Get-ChildItem | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
Get-ChildItem | ForEach-Object { $_.Name.ToUpper() }
```

Aliasuri scurte: `?` = Where-Object, `%` = ForEach-Object, `select` = Select-Object.

## Fișiere și căutare

```powershell
Get-ChildItem -Recurse -Filter "*.log" | Remove-Item        # șterge recursiv după pattern
Select-String -Path *.py -Pattern "TODO" -CaseSensitive
Get-ChildItem -Recurse | Sort-Object Length -Descending | Select -First 10   # cele mai mari
Compare-Object (Get-Content a.txt) (Get-Content b.txt)      # diff
```

## Sistem

```powershell
Get-Process python | Stop-Process -Force
Get-Service | Where-Object Status -eq Running
Test-NetConnection localhost -Port 5432                      # port deschis?
Get-NetTCPConnection -LocalPort 8000                         # cine ține portul
Get-PSDrive -PSProvider FileSystem                           # spațiu pe discuri
```

`Test-NetConnection` și `Get-NetTCPConnection` rezolvă „portul e ocupat, de cine?".

## JSON

```powershell
Get-Content data.json | ConvertFrom-Json                     # → PSCustomObject
$obj | ConvertTo-Json -Depth 10 | Set-Content out.json -Encoding utf8
```

`-Depth` implicit e 2 — obiectele mai adânci se trunchiază silențios. Pune-l mereu.
`ConvertFrom-Json` nu are `-AsHashtable` în 5.1.

## Python pe Windows

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned    # dacă activarea e blocată
$env:PYTHONIOENCODING = "utf-8"                        # dacă diacriticele crapă
```

## Legături

- [[MOC DevOps si Deploy]] · [[Python virtual environments]] · [[Docker cheatsheet]]
