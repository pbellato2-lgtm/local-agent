# Trojan updater - compativel com: irm URL | iex
# Parametros opcionais via $args: -InstallDir <pasta> -Tag <tag> -Force -NoLaunch -Help

$Owner = "pbellato2-lgtm"
$Repo = "local-agent"
$Tag = "latest"
$InstallDir = $null
$Force = $false
$NoLaunch = $false
$ShowHelp = $false

$i = 0
while ($i -lt $args.Count) {
    switch -regex ($args[$i]) {
        '^-Owner$'       { $i++; $Owner = $args[$i] }
        '^-Repo$'        { $i++; $Repo = $args[$i] }
        '^-Tag$'         { $i++; $Tag = $args[$i] }
        '^-InstallDir$'  { $i++; $InstallDir = $args[$i] }
        '^-Force$'       { $Force = $true }
        '^-NoLaunch$'    { $NoLaunch = $true }
        '^-Help$'        { $ShowHelp = $true }
        default { }
    }
    $i++
}

if ($ShowHelp) {
    Write-Host "Trojan updater"
    Write-Host "  -InstallDir <pasta>   pasta da instalacao (auto-detect se omitido)"
    Write-Host "  -Tag <tag>            release (padrao: latest)"
    Write-Host "  -Force                forca a atualizacao"
    Write-Host "  -NoLaunch             nao abre o app ao final"
    return
}

function Say($t) { Write-Host "[Trojan] $t" -ForegroundColor Cyan }
function Warn($t) { Write-Host "[Trojan] $t" -ForegroundColor Yellow }

function Find-InstallDir {
    param([string]$Explicit)
    if ($Explicit) {
        if (-not (Test-Path $Explicit)) { throw "Pasta nao encontrada: $Explicit" }
        return (Resolve-Path $Explicit).Path
    }
    $proc = Get-Process -Name Trojan -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($proc -and $proc.Path) {
        $d = Split-Path -Parent $proc.Path
        if (Test-Path (Join-Path $d "Trojan.exe")) { return $d }
    }
    $roots = @($env:USERPROFILE, [Environment]::GetFolderPath("Desktop"), [Environment]::GetFolderPath("MyDocuments"), "$env:USERPROFILE\Downloads") | Where-Object { $_ -and (Test-Path $_) }
    $candidates = @()
    foreach ($r in $roots) {
        $candidates += Get-ChildItem -Path $r -Filter "Trojan.exe" -Recurse -Depth 4 -ErrorAction SilentlyContinue
    }
    if ($candidates.Count -eq 0) { return $null }
    if ($candidates.Count -eq 1) { return (Split-Path -Parent $candidates[0].FullName) }
    $best = $candidates | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    Warn "Mais de uma instalacao encontrada; usando a mais recente: $($best.FullName)"
    return (Split-Path -Parent $best.FullName)
}

$InstallDir = Find-InstallDir -Explicit $InstallDir
if (-not $InstallDir) {
    throw "Nao encontrei a instalacao. Rode com -InstallDir 'C:\caminho\da\pasta'."
}
Say "Instalacao: $InstallDir"

$proc = Get-Process -Name Trojan -ErrorAction SilentlyContinue
if ($proc) {
    try { $proc | Stop-Process -Force; Start-Sleep -Seconds 2 } catch { Warn "Nao consegui fechar o Trojan.exe (feche manualmente e rode de novo)." }
}

$api = "https://api.github.com/repos/$Owner/$Repo/releases/$Tag"
try {
    $release = Invoke-RestMethod -Uri $api -Headers @{ "User-Agent" = "trojan-updater" }
} catch {
    throw "Falha ao consultar a release: $($_.Exception.Message)"
}
$asset = $release.assets | Where-Object { $_.name -match '\.zip$' } | Select-Object -First 1
if (-not $asset) { throw "Release sem zip." }
Say "Release: $($release.tag_name) - $($asset.name)"

$zipPath = Join-Path $env:TEMP "Trojan-Portable.zip"
Say "Baixando..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath -UseBasicParsing

$backup = Join-Path $env:TEMP "trojan-backup-$(Get-Date -Format yyyyMMddHHmmss)"
New-Item -ItemType Directory -Path $backup -Force | Out-Null
foreach ($name in @("config.json", "session_memory.json")) {
    $p = Join-Path $InstallDir $name
    if (Test-Path $p) { Copy-Item $p $backup -Force }
}
$skills = Join-Path $InstallDir "skills"
if (Test-Path $skills) { Copy-Item $skills $backup -Recurse -Force }

$extract = Join-Path $env:TEMP "trojan-extract"
if (Test-Path $extract) { Remove-Item $extract -Recurse -Force }
New-Item -ItemType Directory -Path $extract -Force | Out-Null
Expand-Archive -Path $zipPath -DestinationPath $extract -Force

foreach ($name in @("config.json", "session_memory.json")) {
    $p = Join-Path $backup $name
    if (Test-Path $p) { Copy-Item $p (Join-Path $extract $name) -Force }
}
$skillsBackup = Join-Path $backup "skills"
if (Test-Path $skillsBackup) {
    $skillsDest = Join-Path $extract "skills"
    if (-not (Test-Path $skillsDest)) { New-Item -ItemType Directory -Path $skillsDest -Force | Out-Null }
    Copy-Item "$skillsBackup\*" $skillsDest -Recurse -Force -ErrorAction SilentlyContinue
}

Get-ChildItem -Path $extract -Force | ForEach-Object { Copy-Item $_.FullName $InstallDir -Recurse -Force }
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
Remove-Item $extract -Recurse -Force -ErrorAction SilentlyContinue

Say "Atualizado em $InstallDir (release $($release.tag_name))."
if (-not $NoLaunch) {
    Start-Process -FilePath (Join-Path $InstallDir "Trojan.exe") -WorkingDirectory $InstallDir
}