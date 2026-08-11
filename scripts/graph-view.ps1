param(
    [ValidateSet('tot','jurnal','cunostinte','proiecte')]
    [string] $View = 'tot',
    [switch] $Wait,
    [switch] $Show,
    [string] $Vault
)

# Diacriticele ies corupte daca scriptul e lansat din alt shell fara asta.
try { [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false) } catch { }

$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Constante
# ---------------------------------------------------------------------------

$WAIT_TIMEOUT_MINUTES  = 60
$POLL_INTERVAL_SECONDS = 5
$SETTLE_SECONDS        = 4      # procesul care se inchide mai scrie o data graph.json
$OBSIDIAN_PROCESS_NAME = 'Obsidian'

$VIEW_FILTERS = @{
    'tot'        = '-path:_templates'
    'jurnal'     = '-path:notes -path:maps -path:cheatsheets -path:snippets -path:decisions -path:inbox -path:people -path:_templates'
    'cunostinte' = '-path:daily -path:weekly -path:projects -path:meetings -path:_templates'
    'proiecte'   = '-path:notes -path:cheatsheets -path:snippets -path:inbox -path:people -path:_templates'
}

$VIEW_DESCRIERI = @{
    'tot'        = 'tot vaultul'
    'jurnal'     = 'jurnal (daily, weekly, meetings, projects)'
    'cunostinte' = 'cunostinte (notes, maps, cheatsheets, snippets, decisions)'
    'proiecte'   = 'proiecte (projects, daily, weekly, meetings, maps, decisions)'
}

# Ordinea conteaza: prima potrivire castiga.
$COLOR_GROUPS = @(
    @{ query = 'tag:#azi-focus'; rgb = 16723349 },
    @{ query = 'tag:#azi';       rgb = 3530874  },
    @{ query = 'path:daily';     rgb = 10980346 },
    @{ query = 'path:projects';  rgb = 16098596 },
    @{ query = 'path:maps';      rgb = 2282990  },
    @{ query = 'path:notes';     rgb = 6333434  }
)

# ---------------------------------------------------------------------------
# Cai - se calculeaza DUPA param(), fiindca $PSScriptRoot e gol in blocul
# param() cand scriptul e pornit cu `powershell -File`.
# ---------------------------------------------------------------------------

function Get-ScriptDirectory {
    if ($PSScriptRoot) { return $PSScriptRoot }
    if ($MyInvocation.MyCommand.Path) {
        return (Split-Path -Parent $MyInvocation.MyCommand.Path)
    }
    return (Get-Location).Path
}

$scriptDir = Get-ScriptDirectory

if (-not $Vault -or $Vault.Trim() -eq '') {
    $Vault = Split-Path -Parent $scriptDir
}

if (-not (Test-Path -LiteralPath $Vault)) {
    Write-Host "Vault inexistent: $Vault" -ForegroundColor Red
    exit 1
}

$Vault      = (Resolve-Path -LiteralPath $Vault).Path
$graphPath  = Join-Path $Vault '.obsidian\graph.json'
$backupPath = "$graphPath.bak"

if (-not (Test-Path -LiteralPath (Join-Path $Vault '.obsidian'))) {
    Write-Host "Nu gasesc .obsidian in: $Vault" -ForegroundColor Red
    Write-Host "Foloseste -Vault ca sa indici vaultul corect." -ForegroundColor Yellow
    exit 1
}

# ---------------------------------------------------------------------------
# Helperi
# ---------------------------------------------------------------------------

function Test-ObsidianRunning {
    try {
        $proc = Get-Process -Name $OBSIDIAN_PROCESS_NAME -ErrorAction Stop
        return ($null -ne $proc)
    } catch {
        return $false
    }
}

function New-GraphConfig {
    param([string] $Filter)

    $groups = foreach ($g in $COLOR_GROUPS) {
        [ordered]@{
            query = $g.query
            color = [ordered]@{ a = 1; rgb = $g.rgb }
        }
    }

    return [ordered]@{
        'collapse-filter'       = $false
        'search'                = $Filter
        'showTags'              = $false
        'showAttachments'       = $false
        'hideUnresolved'        = $true
        'showOrphans'           = $true
        'collapse-color-groups' = $false
        'colorGroups'           = @($groups)
        'collapse-display'      = $false
        'showArrow'             = $false
        'textFadeMultiplier'    = -0.5
        'nodeSizeMultiplier'    = 1.5
        'lineSizeMultiplier'    = 1
        'collapse-forces'       = $false
        'centerStrength'        = 0.4
        'repelStrength'         = 11
        'linkStrength'          = 0.8
        'linkDistance'          = 200
        'scale'                 = 0.5
        'close'                 = $false
    }
}

function Write-GraphConfig {
    param([string] $Filter)

    if (Test-Path -LiteralPath $graphPath) {
        Copy-Item -LiteralPath $graphPath -Destination $backupPath -Force
        Write-Host "Backup: graph.json.bak" -ForegroundColor DarkGray
    }

    $json = New-GraphConfig -Filter $Filter | ConvertTo-Json -Depth 6
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($graphPath, $json, $utf8NoBom)

    Write-Host ""
    Write-Host "Aplicat vederea: $View - $($VIEW_DESCRIERI[$View])" -ForegroundColor Green
    Write-Host "Filtru: $Filter" -ForegroundColor Cyan
    Write-Host "Grupuri de culoare: $($COLOR_GROUPS.Count)" -ForegroundColor DarkGray
    Write-Host "Deschide Obsidian si vederea de graf e deja setata."
}

function Show-CurrentConfig {
    if (-not (Test-Path -LiteralPath $graphPath)) {
        Write-Host "Nu exista inca graph.json in $graphPath" -ForegroundColor Yellow
        return
    }

    try {
        $raw = Get-Content -LiteralPath $graphPath -Raw -Encoding UTF8
        $cfg = $raw | ConvertFrom-Json
    } catch {
        Write-Host "graph.json nu e JSON valid: $($_.Exception.Message)" -ForegroundColor Red
        return
    }

    $groupCount = 0
    if ($cfg.colorGroups) { $groupCount = @($cfg.colorGroups).Count }

    Write-Host ""
    Write-Host "Config curent — $graphPath" -ForegroundColor Cyan
    Write-Host "  Filtru            : $($cfg.search)"
    Write-Host "  Grupuri de culoare: $groupCount"
    Write-Host ""
    Write-Host "  Forte:" -ForegroundColor Cyan
    Write-Host "    centerStrength  : $($cfg.centerStrength)"
    Write-Host "    repelStrength   : $($cfg.repelStrength)"
    Write-Host "    linkStrength    : $($cfg.linkStrength)"
    Write-Host "    linkDistance    : $($cfg.linkDistance)"
    Write-Host ""
    Write-Host "  Afisare:" -ForegroundColor Cyan
    Write-Host "    nodeSizeMultiplier: $($cfg.nodeSizeMultiplier)"
    Write-Host "    lineSizeMultiplier: $($cfg.lineSizeMultiplier)"
    Write-Host "    textFadeMultiplier: $($cfg.textFadeMultiplier)"
    Write-Host "    scale             : $($cfg.scale)"
    Write-Host ""

    if (Test-ObsidianRunning) {
        Write-Host "Obsidian ruleaza acum (scrierea s-ar pierde la inchidere)." -ForegroundColor Yellow
    } else {
        Write-Host "Obsidian nu ruleaza — se poate scrie fara probleme." -ForegroundColor DarkGray
    }
}

function Show-ManualInstructions {
    param([string] $Filter)

    Write-Host ""
    Write-Host "ATENTIE: Obsidian ruleaza acum." -ForegroundColor Yellow
    Write-Host "Obsidian rescrie .obsidian\graph.json la iesirea completa din aplicatie," -ForegroundColor Yellow
    Write-Host "asa ca orice scriere de acum s-ar pierde. NU am modificat nimic." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Varianta rapida — lipeste filtrul asta in lupa din graph view:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  $Filter"
    Write-Host ""
    Write-Host "Varianta automata — inchide complet Obsidian si ruleaza:" -ForegroundColor Cyan
    Write-Host "  .\scripts\graph-view.ps1 -View $View"
    Write-Host ""
    Write-Host "Sau lasa scriptul sa astepte inchiderea:" -ForegroundColor Cyan
    Write-Host "  .\scripts\graph-view.ps1 -View $View -Wait"
    Write-Host ""
}

function Wait-ForObsidianExit {
    $deadline = (Get-Date).AddMinutes($WAIT_TIMEOUT_MINUTES)

    Write-Host ""
    Write-Host "Astept inchiderea completa a Obsidian (timeout $WAIT_TIMEOUT_MINUTES min)..." -ForegroundColor Yellow
    Write-Host "Verific din $POLL_INTERVAL_SECONDS in $POLL_INTERVAL_SECONDS secunde. Ctrl+C ca sa renunti." -ForegroundColor DarkGray

    while ((Get-Date) -lt $deadline) {
        if (-not (Test-ObsidianRunning)) {
            Write-Host "Obsidian s-a inchis. Mai astept $SETTLE_SECONDS secunde (isi scrie configul)..." -ForegroundColor DarkGray
            Start-Sleep -Seconds $SETTLE_SECONDS
            return $true
        }
        Start-Sleep -Seconds $POLL_INTERVAL_SECONDS
    }

    return $false
}

# ---------------------------------------------------------------------------
# Flux principal
# ---------------------------------------------------------------------------

if ($Show) {
    Show-CurrentConfig
    exit 0
}

$filter = $VIEW_FILTERS[$View]

if (-not (Test-ObsidianRunning)) {
    Write-GraphConfig -Filter $filter
    exit 0
}

if (-not $Wait) {
    Show-ManualInstructions -Filter $filter
    exit 0
}

if (Wait-ForObsidianExit) {
    Write-GraphConfig -Filter $filter
    exit 0
}

Write-Host ""
Write-Host "Timeout dupa $WAIT_TIMEOUT_MINUTES de minute — Obsidian tot ruleaza." -ForegroundColor Red
Write-Host "Nu am scris nimic. Inchide Obsidian si ruleaza din nou:" -ForegroundColor Red
Write-Host "  .\scripts\graph-view.ps1 -View $View"
exit 1
