<#
.SYNOPSIS
    Duce commit-urile zilei din repo-urile urmarite in daily note-ul din vault
    si marcheaza in graf notele atinse azi.

.DESCRIPTION
    Ruleaza-l la finalul zilei de lucru (sau oricand). Face trei lucruri:

      1. Citeste commit-urile de azi din fiecare repo urmarit si le scrie in
         `daily/AAAA-LL-ZZ.md`, intre markerii COMMITS:START / COMMITS:END.
         Ce e in afara markerilor - notele tale scrise de mana - nu se atinge.

      2. Muta tag-ul #azi pe nota de azi si pe notele de proiect ale repo-urilor
         in care ai lucrat. In graph view acestea se coloreaza aprins, deci vezi
         dintr-o privire unde ai umblat.

      3. Face commit si push la vault.

.EXAMPLE
    .\sync-daily.ps1
    Sincronizeaza ziua curenta si face push.

.EXAMPLE
    .\sync-daily.ps1 -Date 2026-08-06 -NoPush
    Reconstruieste o zi anterioara, fara push.
#>

[CmdletBinding()]
param(
    [string]   $Vault = (Split-Path -Parent $PSScriptRoot),
    [string]   $Date,
    [switch]   $NoPush,
    [switch]   $NoTag
)

$ErrorActionPreference = 'Stop'
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)

# ---------------------------------------------------------------------------
# Repo-uri urmarite. Adauga aici cand pornesti un proiect nou:
#   Path    = unde e repo-ul pe disc
#   Note    = ce nota din vault il reprezinta (primeste #azi cand lucrezi acolo)
# ---------------------------------------------------------------------------
$TRACKED = @(
    @{ Name = 'ecf-adm-expert';      Path = 'C:\Users\teodor.fotciuc\ecf-adm-expert';      Note = 'projects/ADM Expert.md' }
    @{ Name = 'voice-chat-pizzerie'; Path = 'D:\teodor.fotciuc\voice-chat-pizzerie';       Note = 'projects/Pizza Punto.md' }
)

$MARK_START   = '<!-- COMMITS:START - generat de scripts/sync-daily.ps1, nu edita intre markeri -->'
$MARK_END     = '<!-- COMMITS:END -->'
$TAG_TODAY    = '#azi'
$MAX_FILES    = 14      # cate fisiere listez per commit inainte sa rezum

function Write-Utf8 {
    param([string]$Path, [string]$Content)
    $dir = Split-Path -Parent $Path
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.UTF8Encoding]::new($false))
}

function Read-Utf8 {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return $null }
    return [System.IO.File]::ReadAllText($Path, [System.Text.UTF8Encoding]::new($false))
}

# ---------------------------------------------------------------------------
# Commit-urile unui repo dintr-o zi anume
# ---------------------------------------------------------------------------
function Get-DayCommits {
    param([string]$RepoPath, [string]$Day)

    if (-not (Test-Path (Join-Path $RepoPath '.git'))) { return @() }

    $since = "$Day 00:00:00"
    $until = "$Day 23:59:59"
    $sep   = [char]0x1F

    $raw = git -C $RepoPath log --all --no-merges --since=$since --until=$until `
                --date=format:'%H:%M' --pretty=format:"%h$sep%ad$sep%s$sep%an" 2>$null
    if (-not $raw) { return @() }

    $out = @()
    foreach ($line in @($raw)) {
        if (-not $line) { continue }
        $p = $line -split $sep
        if ($p.Count -lt 3) { continue }

        $hash = $p[0]

        # statistici: cate fisiere, cate linii
        $numstat = git -C $RepoPath show --numstat --format='' $hash 2>$null
        $files = @(); $ins = 0; $del = 0
        foreach ($n in @($numstat)) {
            if (-not $n) { continue }
            $c = $n -split "`t"
            if ($c.Count -lt 3) { continue }
            if ($c[0] -ne '-') { $ins += [int]$c[0] }
            if ($c[1] -ne '-') { $del += [int]$c[1] }
            $files += $c[2]
        }

        # pe ce branch-uri traieste
        $branches = @(git -C $RepoPath branch --contains $hash 2>$null |
                      ForEach-Object { $_.TrimStart('*', ' ').Trim() } |
                      Where-Object { $_ })

        $out += [pscustomobject]@{
            Hash     = $hash
            Time     = $p[1]
            Subject  = $p[2]
            Author   = if ($p.Count -gt 3) { $p[3] } else { '' }
            Files    = $files
            Ins      = $ins
            Del      = $del
            Branches = $branches
        }
    }
    # git log da cel mai nou primul; vreau cronologic
    return @($out | Sort-Object Time)
}

# ---------------------------------------------------------------------------
# Blocul markdown cu commit-urile zilei
# ---------------------------------------------------------------------------
function Build-CommitSection {
    param([hashtable[]]$Repos, [string]$Day)

    $sb  = [System.Text.StringBuilder]::new()
    $any = $false
    $totalCommits = 0; $totalFiles = 0; $totalIns = 0; $totalDel = 0

    $blocks = [System.Text.StringBuilder]::new()

    foreach ($r in $Repos) {
        $commits = @(Get-DayCommits -RepoPath $r.Path -Day $Day)
        if ($commits.Count -eq 0) { continue }
        $any = $true

        [void]$blocks.AppendLine("### $($r.Name)")
        [void]$blocks.AppendLine()

        foreach ($c in $commits) {
            $totalCommits++
            $totalFiles += $c.Files.Count
            $totalIns   += $c.Ins
            $totalDel   += $c.Del

            $br = if ($c.Branches.Count) { ' · `' + ($c.Branches -join '` `') + '`' } else { '' }
            [void]$blocks.AppendLine("**$($c.Time)** · ``$($c.Hash)``$br")
            [void]$blocks.AppendLine()
            [void]$blocks.AppendLine($c.Subject)
            [void]$blocks.AppendLine()
            [void]$blocks.AppendLine("$($c.Files.Count) fișiere · +$($c.Ins) / −$($c.Del)")
            [void]$blocks.AppendLine()

            if ($c.Files.Count) {
                $show = $c.Files | Select-Object -First $MAX_FILES
                foreach ($f in $show) { [void]$blocks.AppendLine("- ``$f``") }
                if ($c.Files.Count -gt $MAX_FILES) {
                    [void]$blocks.AppendLine("- *… și încă $($c.Files.Count - $MAX_FILES) fișiere*")
                }
                [void]$blocks.AppendLine()
            }
        }
    }

    [void]$sb.AppendLine($MARK_START)
    [void]$sb.AppendLine("## Commit-uri")
    [void]$sb.AppendLine()

    if (-not $any) {
        [void]$sb.AppendLine("*Niciun commit în ziua asta, în repo-urile urmărite.*")
        [void]$sb.AppendLine()
    } else {
        [void]$sb.AppendLine("> **$totalCommits** commit-uri · **$totalFiles** fișiere atinse · **+$totalIns / −$totalDel** linii")
        [void]$sb.AppendLine()
        [void]$sb.Append($blocks.ToString())
    }

    [void]$sb.Append($MARK_END)

    return @{
        Text    = $sb.ToString()
        Any     = $any
        Commits = $totalCommits
    }
}

# ---------------------------------------------------------------------------
# Scrie blocul in daily note, pastrand ce ai scris tu
# ---------------------------------------------------------------------------
function Update-DailyNote {
    param([string]$Path, [string]$Day, [string]$Section)

    $existing = Read-Utf8 $Path

    if ($null -eq $existing) {
        $body = @"
---
tags: [daily]
created: $Day
type: daily
---

# $Day

## Focus de azi
-

## Tasks
- [ ]

## Notes


$Section

## Deschis / de continuat
-
"@
        Write-Utf8 -Path $Path -Content $body
        return 'creat'
    }

    $iStart = $existing.IndexOf($MARK_START)
    $iEnd   = $existing.IndexOf($MARK_END)

    if ($iStart -ge 0 -and $iEnd -gt $iStart) {
        $before = $existing.Substring(0, $iStart)
        $after  = $existing.Substring($iEnd + $MARK_END.Length)
        Write-Utf8 -Path $Path -Content ($before + $Section + $after)
        return 'actualizat'
    }

    # fara markeri inca: pun blocul inainte de "## Deschis", altfel la final
    $anchor = "`n## Deschis"
    $iAnchor = $existing.IndexOf($anchor)
    if ($iAnchor -ge 0) {
        $new = $existing.Substring(0, $iAnchor) + "`n" + $Section + "`n" + $existing.Substring($iAnchor)
    } else {
        $new = $existing.TrimEnd() + "`n`n" + $Section + "`n"
    }
    Write-Utf8 -Path $Path -Content $new
    return 'inserat'
}

# ---------------------------------------------------------------------------
# Tag-ul #azi: scos de peste tot, pus doar unde ai lucrat azi
# ---------------------------------------------------------------------------
function Set-TodayTag {
    param([string]$VaultPath, [string[]]$TargetRelPaths)

    $targets = @{}
    foreach ($t in $TargetRelPaths) {
        $targets[(Join-Path $VaultPath ($t -replace '/', '\'))] = $true
    }

    $touched = @{ Added = @(); Removed = @() }

    $notes = Get-ChildItem $VaultPath -Recurse -Filter *.md -File |
             Where-Object { $_.FullName -notlike '*\.obsidian\*' }

    foreach ($n in $notes) {
        $text = Read-Utf8 $n.FullName
        if ($null -eq $text) { continue }

        $hasTag  = $text -match "(?m)^\s*$([regex]::Escape($TAG_TODAY))\s*$"
        $wantTag = $targets.ContainsKey($n.FullName)

        if ($hasTag -and -not $wantTag) {
            $new = [regex]::Replace($text, "(?m)^\s*$([regex]::Escape($TAG_TODAY))\s*\r?\n?", '')
            Write-Utf8 -Path $n.FullName -Content $new
            $touched.Removed += $n.Name
        }
        elseif ($wantTag -and -not $hasTag) {
            $new = $text.TrimEnd() + "`n`n$TAG_TODAY`n"
            Write-Utf8 -Path $n.FullName -Content $new
            $touched.Added += $n.Name
        }
    }

    return $touched
}

# ===========================================================================
# Executie
# ===========================================================================

if (-not $Date) { $Date = (Get-Date).ToString('yyyy-MM-dd') }
if ($Date -notmatch '^\d{4}-\d{2}-\d{2}$') { throw "Data trebuie in format AAAA-LL-ZZ, am primit '$Date'" }
if (-not (Test-Path $Vault)) { throw "Vaultul nu exista: $Vault" }

Write-Host "Vault : $Vault"
Write-Host "Ziua  : $Date"
Write-Host ""

# repo-uri care exista chiar pe disc
$live = @()
foreach ($r in $TRACKED) {
    if (Test-Path (Join-Path $r.Path '.git')) { $live += $r }
    else { Write-Host "  ! sar peste $($r.Name) - nu e repo git la $($r.Path)" -ForegroundColor DarkYellow }
}

$section = Build-CommitSection -Repos $live -Day $Date

$dailyPath = Join-Path $Vault "daily\$Date.md"
$action    = Update-DailyNote -Path $dailyPath -Day $Date -Section $section.Text
Write-Host "  daily/$Date.md  -> $action ($($section.Commits) commit-uri)"

# notele care primesc #azi: daily-ul + proiectele in care s-a lucrat
if (-not $NoTag) {
    $tagTargets = @("daily/$Date.md")
    foreach ($r in $live) {
        # @(...) obligatoriu: PowerShell despacheteaza array-ul de un element la
        # return, iar .Count pe obiectul singular da $null, nu 1.
        $c = @(Get-DayCommits -RepoPath $r.Path -Day $Date)
        if ($c.Count -gt 0 -and $r.Note) { $tagTargets += $r.Note }
    }

    $tag = Set-TodayTag -VaultPath $Vault -TargetRelPaths $tagTargets
    if ($tag.Added.Count)   { Write-Host "  #azi pus pe    : $($tag.Added -join ', ')" }
    if ($tag.Removed.Count) { Write-Host "  #azi scos de pe: $($tag.Removed -join ', ')" }
    if (-not $tag.Added.Count -and -not $tag.Removed.Count) { Write-Host "  #azi: nimic de schimbat" }
}

# commit + push vault
$dirty = git -C $Vault status --porcelain
if (-not $dirty) {
    Write-Host ""
    Write-Host "Nimic nou de salvat in vault." -ForegroundColor DarkGray
    exit 0
}

git -C $Vault add -A | Out-Null
$msg = "notes: sync $Date - $($section.Commits) commit-uri din repo-urile urmarite"
git -C $Vault commit -q -m $msg
Write-Host ""
Write-Host "  commit vault: $(git -C $Vault rev-parse --short HEAD)"

if ($NoPush) {
    Write-Host "  push sarit (-NoPush)" -ForegroundColor DarkGray
} else {
    git -C $Vault push -q origin main 2>$null | Out-Null
    git -C $Vault fetch -q origin
    $local  = git -C $Vault rev-parse HEAD
    $remote = git -C $Vault rev-parse origin/main
    if ($local -eq $remote) { Write-Host "  push: sincron cu origin/main" -ForegroundColor Green }
    else { Write-Host "  push: NU a ajuns pe remote - verifica" -ForegroundColor Red; exit 1 }
}
