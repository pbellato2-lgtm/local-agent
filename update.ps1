#Requires -Version 5.1
param(
    [string]$Owner = "pbellato2-lgtm",
    [string]$Repo = "local-agent",
    [string]$Tag = "latest",
    [string]$InstallDir,
    [switch]$Force,
    [switch]$NoLaunch
)
$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Say($t) { Write-Host "[Trojan] $t" -ForegroundColor Cyan }

if (-not $InstallDir) {
    $candidates = @("$env:USERPROFILE\Trojan") | Where-Object { Test-Path $_ }
    if ($candidates) { $InstallDir = $candidates[0] } else { throw "Nao encontrei a instalacao." }
}
$InstallDir = (Resolve-Path $InstallDir).Path
Say "Instalacao: $InstallDir"

$proc = Get-Process -Name Trojan -ErrorAction SilentlyContinue
if ($proc) { $proc | Stop-Process -Force; Start-Sleep -Seconds 2 }

$api = "https://api.github.com/repos/$Owner/$Repo/releases/$Tag"
$release = Invoke-RestMethod -Uri $api -Headers @{ "User-Agent" = "trojan-updater" }
$asset = $release.assets | Where-Object { $_.name -match '\.zip$' } | Select-Object -First 1
if (-not $asset) { throw "Release sem zip." }

$zipPath = Join-Path $env:TEMP "Trojan-Portable.zip"
Say "Baixando $($asset.name)..."
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

Say "Atualizado."
if (-not $NoLaunch) { Start-Process -FilePath (Join-Path $InstallDir "Trojan.exe") -WorkingDirectory $InstallDir }
