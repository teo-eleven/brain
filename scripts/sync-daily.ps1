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
    [string]   $Vault,
    [string]   $Date,
    [switch]   $NoPush,
    [switch]   $NoTag
)

# $PSScriptRoot e gol in blocul param() cand scriptul e pornit cu `powershell -File`
# (merge doar cu `& script.ps1`). $MyInvocation.MyCommand.Path acopera ambele cazuri.
# param() trebuie sa ramana prima instructiune, deci calculul se face aici.
if (-not $Vault) {
    $scriptDir = if ($PSScriptRoot) {
        $PSScriptRoot
    } else {
        Split-Path -Parent $MyInvocation.MyCommand.Path
    }
    $Vault = Split-Path -Parent $scriptDir
}

$ErrorActionPreference = 'Stop'
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)

# $OutputEncoding de mai sus spune doar cum TRIMIT text catre procesele native.
# Asta spune cum DECODEZ ce scriu ele inapoi. Fara ea, mesajele de commit cu diacritice
# ies corupte ("tranzi╚¢ii" in loc de "tranzitii") cand scriptul e pornit din alt shell
# decat o consola PowerShell - exact cazul hook-ului, care il lanseaza cu `powershell -File`.
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

# ---------------------------------------------------------------------------
# Repo-uri urmarite. Adauga aici cand pornesti un proiect nou:
#   Path    = unde e repo-ul pe disc
#   Note    = ce nota din vault il reprezinta (primeste #azi cand lucrezi acolo)
# ---------------------------------------------------------------------------
$TRACKED = @(
    @{ Name = 'ecf-adm-expert';      Path = 'C:\Users\teodor.fotciuc\ecf-adm-expert';      Note = 'projects/ADM Expert.md' }
    @{ Name = 'voice-chat-pizzerie'; Path = 'D:\teodor.fotciuc\voice-chat-pizzerie';       Note = 'projects/Pizza Punto.md' }
    @{ Name = 'ecf-inventory-management'; Path = 'D:\teodor.fotciuc\ecf-inventory-management'; Note = 'projects/Inventory Pro.md' }
    @{ Name = 'ecf_app_web-doc_extract_studio'; Path = 'D:\teodor.fotciuc\ecf_app_web-doc_extract_studio'; Note = 'projects/QA AI Agent.md' }
    @{ Name = 'qa-ai-agent'; Path = 'D:\teodor.fotciuc\qa-ai-agent'; Note = 'projects/QA AI Agent.md' }
)

$MARK_START   = '<!-- COMMITS:START - generat de scripts/sync-daily.ps1, nu edita intre markeri -->'
$MARK_END     = '<!-- COMMITS:END -->'
$TAG_TODAY    = '#azi'        # notele secundare atinse azi (verde in graf)
$TAG_FOCUS    = '#azi-focus'  # nota zilei, nodul principal (magenta in graf)
$MAX_FILES    = 14            # cate fisiere listez per commit inainte sa rezum

# Canvas-ul zilei: pozitii fixe, ce nu se poate obtine in graph view
$CANVAS_FILE  = 'Azi.canvas'
$C_FOCUS      = '#ff2d95'   # magenta - nodul zilei
$C_TODAY      = '#35e07a'   # verde   - notele atinse azi
$C_TEAMS      = '#00d9ff'   # cyan    - sedinte si task-uri din Teams
$C_ANCHOR     = '#8a93a5'   # gri     - ancorele vaultului

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
    param(
        [string]   $VaultPath,
        [string]   $FocusRelPath,      # nota zilei    -> #azi-focus
        [string[]] $TouchedRelPaths    # notele atinse -> #azi
    )

    function Resolve-Rel { param($p) Join-Path $VaultPath ($p -replace '/', '\') }

    $wantFocus = @{}
    if ($FocusRelPath) { $wantFocus[(Resolve-Rel $FocusRelPath)] = $true }

    $wantToday = @{}
    foreach ($t in $TouchedRelPaths) { $wantToday[(Resolve-Rel $t)] = $true }

    $touched = @{ Added = @(); Removed = @() }

    # ordinea conteaza: #azi-focus contine #azi ca prefix, deci il scot pe cel
    # lung primul, altfel raman resturi de tip "-focus" in nota
    $rxFocus = "(?m)^\s*$([regex]::Escape($TAG_FOCUS))\s*\r?\n?"
    $rxToday = "(?m)^\s*$([regex]::Escape($TAG_TODAY))\s*\r?\n?"

    $notes = Get-ChildItem $VaultPath -Recurse -Filter *.md -File |
             Where-Object { $_.FullName -notlike '*\.obsidian\*' }

    foreach ($n in $notes) {
        $text = Read-Utf8 $n.FullName
        if ($null -eq $text) { continue }

        $orig    = $text
        $isFocus = $wantFocus.ContainsKey($n.FullName)
        $isToday = $wantToday.ContainsKey($n.FullName)

        # curat ambele tag-uri, apoi pun ce trebuie
        $text = [regex]::Replace($text, $rxFocus, '')
        $text = [regex]::Replace($text, $rxToday, '')

        $tag = if ($isFocus) { $TAG_FOCUS } elseif ($isToday) { $TAG_TODAY } else { $null }
        if ($tag) { $text = $text.TrimEnd() + "`n`n$tag`n" }

        if ($text -ne $orig) {
            Write-Utf8 -Path $n.FullName -Content $text
            if ($tag) { $touched.Added += "$($n.Name) [$tag]" } else { $touched.Removed += $n.Name }
        }
    }

    return $touched
}

# ---------------------------------------------------------------------------
# Canvas-ul zilei
#
# Graph view-ul Obsidian e force-directed: pozitiile sunt REZULTATUL simularii
# fizice, nu date de intrare. Nu exista setare care sa spuna "nodul asta sta la
# dreapta". Canvas e singurul loc din Obsidian cu coordonate explicite, deci aici
# construiesc harta zilei: azi la dreapta, Teams dedesubt, legaturile intacte.
# ---------------------------------------------------------------------------
function New-CanvasNode {
    param($Id, $Type, $File, $Text, $Label, $X, $Y, $W, $H, $Color)
    $n = [ordered]@{ id = $Id; type = $Type; x = $X; y = $Y; width = $W; height = $H }
    if ($Type -eq 'file')  { $n.file  = $File }
    if ($Type -eq 'text')  { $n.text  = $Text }
    if ($Type -eq 'group') { $n.label = $Label }
    if ($Color)            { $n.color = $Color }
    return [pscustomobject]$n
}

function New-CanvasEdge {
    param($Id, $From, $FromSide, $To, $ToSide, $Color, $Label)
    $e = [ordered]@{
        id = $Id; fromNode = $From; fromSide = $FromSide; toNode = $To; toSide = $ToSide
    }
    if ($Color) { $e.color = $Color }
    if ($Label) { $e.label = $Label }
    return [pscustomobject]$e
}

function Get-TeamsItems {
    param([string]$VaultPath)
    # Populat de mine dupa autentificarea Microsoft 365; scriptul merge si fara el.
    $cache = Join-Path $VaultPath 'scripts\teams-cache.json'
    if (-not (Test-Path $cache)) { return @() }
    try {
        $raw = Read-Utf8 $cache
        if (-not $raw) { return @() }
        return @(($raw | ConvertFrom-Json).items)
    } catch {
        Write-Host "  ! teams-cache.json nu se poate citi: $($_.Exception.Message)" -ForegroundColor DarkYellow
        return @()
    }
}

function Build-Canvas {
    param(
        [string]   $VaultPath,
        [string]   $Day,
        [string[]] $TouchedNotes   # cai relative catre notele de proiect atinse azi
    )

    $nodes = New-Object System.Collections.ArrayList
    $edges = New-Object System.Collections.ArrayList
    $k = 0
    function NextId { $script:k++; return ("n{0:D3}" -f $script:k) }

    # ---- ancorele vaultului, stanga ----
    $ANCHORS = @(
        @{ File = '00 START HERE.md';                 Y = -340 }
        @{ File = 'Dashboard.md';                     Y = -110 }
        @{ File = 'maps/MOC Vault - cum functioneaza.md'; Y = 130 }
    )

    $anchorIds = @{}
    foreach ($a in $ANCHORS) {
        if (-not (Test-Path (Join-Path $VaultPath ($a.File -replace '/', '\')))) { continue }
        $id = NextId
        [void]$nodes.Add((New-CanvasNode -Id $id -Type 'file' -File $a.File `
            -X -760 -Y $a.Y -W 360 -H 200 -Color $C_ANCHOR))
        $anchorIds[$a.File] = $id
    }

    $dashId = $anchorIds['Dashboard.md']

    # ---- zona AZI, impinsa clar la dreapta ----
    $aziX     = 560
    $aziCount = 1 + $TouchedNotes.Count
    $aziH     = 340 + ($TouchedNotes.Count * 210) + 80

    [void]$nodes.Add((New-CanvasNode -Id (NextId) -Type 'group' -Label "AZI · $Day" `
        -X ($aziX - 40) -Y -420 -W 580 -H $aziH -Color $C_FOCUS))

    $focusId   = NextId
    $focusFile = "daily/$Day.md"
    [void]$nodes.Add((New-CanvasNode -Id $focusId -Type 'file' -File $focusFile `
        -X $aziX -Y -360 -W 500 -H 300 -Color $C_FOCUS))

    # nota zilei ramane legata de vault
    if ($dashId) {
        [void]$edges.Add((New-CanvasEdge -Id (NextId) -From $focusId -FromSide 'left' `
            -To $dashId -ToSide 'right' -Color $C_FOCUS -Label 'ziua curentă'))
    }

    $y = -20
    $projIds = @()
    foreach ($p in $TouchedNotes) {
        if (-not (Test-Path (Join-Path $VaultPath ($p -replace '/', '\')))) { continue }
        $id = NextId
        [void]$nodes.Add((New-CanvasNode -Id $id -Type 'file' -File $p `
            -X $aziX -Y $y -W 500 -H 180 -Color $C_TODAY))
        [void]$edges.Add((New-CanvasEdge -Id (NextId) -From $id -FromSide 'top' `
            -To $focusId -ToSide 'bottom' -Color $C_TODAY))
        $projIds += $id
        $y += 210
    }

    # ---- zona TEAMS, dedesubt ----
    $teams  = Get-TeamsItems -VaultPath $VaultPath
    $teamsY = 620
    $teamsW = if ($teams.Count) { [Math]::Max(900, 40 + $teams.Count * 340) } else { 900 }

    [void]$nodes.Add((New-CanvasNode -Id (NextId) -Type 'group' -Label 'TEAMS · ședințe și taskuri' `
        -X -200 -Y ($teamsY - 60) -W $teamsW -H 360 -Color $C_TEAMS))

    if ($teams.Count -eq 0) {
        $txt = @"
### Teams — încă neconectat

Aici intră următoarele ședințe și taskurile primite de la echipă.

Ca să le aduc: rulează **/mcp** în Claude Code și autentifică
**claude.ai Microsoft 365**. Apoi scriu `scripts/teams-cache.json`
și zona asta se populează la următorul sync.
"@
        $tid = NextId
        [void]$nodes.Add((New-CanvasNode -Id $tid -Type 'text' -Text $txt `
            -X -160 -Y $teamsY -W 520 -H 240 -Color $C_TEAMS))
        if ($dashId) {
            [void]$edges.Add((New-CanvasEdge -Id (NextId) -From $tid -FromSide 'top' `
                -To $dashId -ToSide 'bottom' -Color $C_TEAMS))
        }
    }
    else {
        $tx = -160
        foreach ($t in $teams) {
            $when  = if ($t.when)  { $t.when }  else { '' }
            $title = if ($t.title) { $t.title } else { '(fără titlu)' }
            $who   = if ($t.who)   { "`n`n$($t.who)" } else { '' }
            $kind  = if ($t.kind -eq 'task') { 'TASK' } else { 'ȘEDINȚĂ' }

            $txt = "**$kind · $when**`n`n### $title$who"
            $tid = NextId
            [void]$nodes.Add((New-CanvasNode -Id $tid -Type 'text' -Text $txt `
                -X $tx -Y $teamsY -W 300 -H 240 -Color $C_TEAMS))

            # leaga de proiectul potrivit daca stiu care e, altfel de ziua curenta
            $target = $focusId
            if ($t.note) {
                $idx = [array]::IndexOf($TouchedNotes, $t.note)
                if ($idx -ge 0 -and $idx -lt $projIds.Count) { $target = $projIds[$idx] }
            }
            [void]$edges.Add((New-CanvasEdge -Id (NextId) -From $tid -FromSide 'top' `
                -To $target -ToSide 'bottom' -Color $C_TEAMS))
            $tx += 340
        }
    }

    $canvas = [ordered]@{ nodes = @($nodes); edges = @($edges) }
    $json   = $canvas | ConvertTo-Json -Depth 8
    Write-Utf8 -Path (Join-Path $VaultPath $CANVAS_FILE) -Content $json

    return @{ Nodes = $nodes.Count; Edges = $edges.Count; Teams = $teams.Count }
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

# notele de proiect in care s-a lucrat azi
$touchedNotes = @()
foreach ($r in $live) {
    # @(...) obligatoriu: PowerShell despacheteaza array-ul de un element la
    # return, iar .Count pe obiectul singular da $null, nu 1.
    $c = @(Get-DayCommits -RepoPath $r.Path -Day $Date)
    if ($c.Count -gt 0 -and $r.Note) { $touchedNotes += $r.Note }
}

if (-not $NoTag) {
    $tag = Set-TodayTag -VaultPath $Vault -FocusRelPath "daily/$Date.md" -TouchedRelPaths $touchedNotes
    if ($tag.Added.Count)   { Write-Host "  tag pus pe : $($tag.Added -join ', ')" }
    if ($tag.Removed.Count) { Write-Host "  tag scos de: $($tag.Removed -join ', ')" }
    if (-not $tag.Added.Count -and -not $tag.Removed.Count) { Write-Host "  taguri: nimic de schimbat" }
}

$cv = Build-Canvas -VaultPath $Vault -Day $Date -TouchedNotes $touchedNotes
$teamsInfo = if ($cv.Teams) { "$($cv.Teams) intrări Teams" } else { "Teams neconectat" }
Write-Host "  $CANVAS_FILE     -> $($cv.Nodes) noduri, $($cv.Edges) legături ($teamsInfo)"

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
