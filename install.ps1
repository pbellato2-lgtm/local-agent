#Requires -Version 5.1
param(
    [string]$Owner = "pbellato2-lgtm",
    [string]$Repo = "local-agent",
    [string]$Tag = "latest",
    [string]$Dest = "$env:USERPROFILE\Trojan",
    [switch]$NoLaunch
)
$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Say($t) { Write-Host "[Trojan] $t" -ForegroundColor Cyan }

Say "Buscando release..."
$api = "https://api.github.com/repos/$Owner/$Repo/releases/$Tag"
$release = Invoke-RestMethod -Uri $api -Headers @{ "User-Agent" = "trojan-installer" }
$asset = $release.assets | Where-Object { $_.name -match '\.zip$' } | Select-Object -First 1
if (-not $asset) { throw "Release sem zip portatil." }

$zipPath = Join-Path $env:TEMP "Trojan-Portable.zip"
Say "Baixando $($asset.name)..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath -UseBasicParsing

if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }
Say "Extraindo em $Dest ..."
Expand-Archive -Path $zipPath -DestinationPath $Dest -Force
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue

$desktop = [Environment]::GetFolderPath("Desktop")
$lnk = Join-Path $desktop "Trojan.lnk"
$wsh = New-Object -ComObject WScript.Shell
$sc = $wsh.CreateShortcut($lnk)
$sc.TargetPath = Join-Path $Dest "Trojan.exe"
$sc.WorkingDirectory = $Dest
$sc.IconLocation = Join-Path $Dest "trojan.ico"
$sc.Save()

Say "Instalado em $Dest"
if (-not $NoLaunch) { Start-Process -FilePath (Join-Path $Dest "Trojan.exe") -WorkingDirectory $Dest }
