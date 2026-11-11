# Trojan clean reinstall - preserva conversas, pastas, config e skills
# Uso: irm URL | iex
# ou:  .\clean-reinstall.ps1 -InstallDir 'C:\caminho' -NoLaunch

$Owner = "pbellato2-lgtm"
$Repo = "local-agent"
$Tag = "latest"
$InstallDir = $null
$NoLaunch = $false
$ShowHelp = $false

$i = 0
while ($i -lt $args.Count) {
    switch -regex ($args[$i]) {
        '^-InstallDir$'  { $i++; $InstallDir = $args[$i] }
        '^-NoLaunch$'    { $NoLaunch = $true }
        '^-Help$'        { $ShowHelp = $true }
        default { }
    }
    $i++
}

if ($ShowHelp) {
    Write-Host "Trojan clean reinstall"
    Write-Host "  -InstallDir <pasta>   pasta da instalacao (auto-detect se omitido)"
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

# para o app e workers
$proc = Get-Process -Name Trojan -ErrorAction SilentlyContinue
if ($proc) {
    try { $proc | Stop-Process -Force; Start-Sleep -Seconds 2 } catch { Warn "Nao consegui fechar o Trojan.exe." }
}
Get-Process powershell -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -and (Split-Path -Parent $_.Path) -eq $InstallDir
} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

# backup completo dos dados do usuario
$backup = Join-Path $env:TEMP "trojan-backup-$(Get-Date -Format yyyyMMddHHmmss)"
New-Item -ItemType Directory -Path $backup -Force | Out-Null

# 1. config.json
foreach ($name in @("config.json", "session_memory.json")) {
    $p = Join-Path $InstallDir $name
    if (Test-Path $p) { Copy-Item $p $backup -Force; Say "Backup: $name" }
}

# 2. skills/
$skills = Join-Path $InstallDir "skills"
if (Test-Path $skills) { Copy-Item $skills $backup -Recurse -Force; Say "Backup: skills/" }

# 3. EBWebView (WebView2 user data - localStorage com chats e pastas)
$ebDirs = @()
$ebDirs += Get-ChildItem -Path $InstallDir -Filter "EBWebView" -Recurse -Directory -ErrorAction SilentlyContinue
$ebDirs += Get-ChildItem -Path "$env:LOCALAPPDATA" -Filter "EBWebView" -Recurse -Directory -ErrorAction SilentlyContinue | Where-Object { $_.FullName -match 'trojan|Trojan' }
$ebDirs += Get-ChildItem -Path "$env:APPDATA" -Filter "EBWebView" -Recurse -Directory -ErrorAction SilentlyContinue | Where-Object { $_.FullName -match 'trojan|Trojan' }
foreach ($eb in $ebDirs) {
    $dest = Join-Path $backup "EBWebView_$(Split-Path -Leaf (Split-Path -Parent $eb.FullName))"
    Copy-Item $eb.FullName $dest -Recurse -Force
    Say "Backup: EBWebView ($($eb.FullName))"
}

# 4. qualquer arquivo de dados extra
foreach ($name in @("trojan.folders*", "trojan.chats*", "*.json")) {
    Get-ChildItem -Path $InstallDir -Filter $name -File -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.Name -notin @("config.json","session_memory.json","version.txt")) {
            Copy-Item $_.FullName $backup -Force
            Say "Backup: $($_.Name)"
        }
    }
}

Say "Backup completo em: $backup"

# limpa a pasta de instalacao (remove tudo exceto o backup que esta no TEMP)
Say "Limpando pasta de instalacao..."
Get-ChildItem -Path $InstallDir -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Say "Pasta limpa."

# baixa release
$api = "https://api.github.com/repos/$Owner/$Repo/releases/$Tag"
$release = Invoke-RestMethod -Uri $api -Headers @{ "User-Agent" = "trojan-reinstall" }
$asset = $release.assets | Where-Object { $_.name -match '\.zip$' } | Select-Object -First 1
if (-not $asset) { throw "Release sem zip." }
Say "Release: $($release.tag_name) - $($asset.name)"

$zipPath = Join-Path $env:TEMP "Trojan-Portable.zip"
Say "Baixando..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath -UseBasicParsing

# extrai
$extract = Join-Path $env:TEMP "trojan-extract"
if (Test-Path $extract) { Remove-Item $extract -Recurse -Force }
New-Item -ItemType Directory -Path $extract -Force | Out-Null
Expand-Archive -Path $zipPath -DestinationPath $extract -Force

# restaura dados do usuario
foreach ($name in @("config.json", "session_memory.json")) {
    $p = Join-Path $backup $name
    if (Test-Path $p) { Copy-Item $p (Join-Path $extract $name) -Force; Say "Restaurado: $name" }
}
$skillsBackup = Join-Path $backup "skills"
if (Test-Path $skillsBackup) {
    $skillsDest = Join-Path $extract "skills"
    if (-not (Test-Path $skillsDest)) { New-Item -ItemType Directory -Path $skillsDest -Force | Out-Null }
    Copy-Item "$skillsBackup\*" $skillsDest -Recurse -Force
    Say "Restaurado: skills/"
}
# restaura EBWebView
Get-ChildItem -Path $backup -Filter "EBWebView_*" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $ebName = $_.Name -replace '^EBWebView_', ''
    $dest = Join-Path $extract $_.Name
    Copy-Item $_.FullName $dest -Recurse -Force
    Say "Restaurado: $($_.Name)"
}

# copia tudo para a pasta de instalacao
Get-ChildItem -Path $extract -Force | ForEach-Object { Copy-Item $_.FullName $InstallDir -Recurse -Force }
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
Remove-Item $extract -Recurse -Force -ErrorAction SilentlyContinue

Say "Reinstalado em $InstallDir (release $($release.tag_name))."
Say "Backup dos seus dados: $backup"
if (-not $NoLaunch) {
    Start-Process -FilePath (Join-Path $InstallDir "Trojan.exe") -WorkingDirectory $InstallDir
}