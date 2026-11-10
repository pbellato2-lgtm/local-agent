param(
  [ValidateSet('get', 'set')][string]$Action = 'get',
  [string]$TextFile = ''
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Stop'

if ($Action -eq 'get') {
  $value = Get-Clipboard -Raw
  if ($null -ne $value) {
    [Console]::Out.Write($value)
  }
}
else {
  if (-not $TextFile -or -not (Test-Path -LiteralPath $TextFile)) {
    Write-Error 'TextFile nao encontrado'
    exit 1
  }
  $text = [System.IO.File]::ReadAllText($TextFile, [System.Text.Encoding]::UTF8)
  Set-Clipboard -Value $text
  Write-Output 'ok'
}
