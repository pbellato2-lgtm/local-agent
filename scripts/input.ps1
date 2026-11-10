param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('move', 'click', 'double_click', 'right_click', 'scroll', 'type', 'keys')]
  [string]$Action,
  [int]$X = 0,
  [int]$Y = 0,
  [int]$Amount = 0,
  [string]$Keys = '',
  [string]$TextFile = ''
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class TrojanInput {
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int X, int Y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, int dx, int dy, int data, UIntPtr extra);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
}
"@

[TrojanInput]::SetProcessDPIAware() | Out-Null

function Invoke-Mouse([uint32]$Flags) {
  [TrojanInput]::mouse_event($Flags, 0, 0, 0, [UIntPtr]::Zero)
}

switch ($Action) {
  'move' {
    [TrojanInput]::SetCursorPos($X, $Y) | Out-Null
  }
  'click' {
    [TrojanInput]::SetCursorPos($X, $Y) | Out-Null
    Start-Sleep -Milliseconds 40
    Invoke-Mouse 0x0002
    Invoke-Mouse 0x0004
  }
  'double_click' {
    [TrojanInput]::SetCursorPos($X, $Y) | Out-Null
    Start-Sleep -Milliseconds 40
    Invoke-Mouse 0x0002
    Invoke-Mouse 0x0004
    Start-Sleep -Milliseconds 80
    Invoke-Mouse 0x0002
    Invoke-Mouse 0x0004
  }
  'right_click' {
    [TrojanInput]::SetCursorPos($X, $Y) | Out-Null
    Start-Sleep -Milliseconds 40
    Invoke-Mouse 0x0008
    Invoke-Mouse 0x0010
  }
  'scroll' {
    if ($Amount -eq 0) { $Amount = 3 }
    [TrojanInput]::mouse_event(0x0800, 0, 0, ($Amount * 120), [UIntPtr]::Zero)
  }
  'type' {
    if (-not $TextFile -or -not (Test-Path -LiteralPath $TextFile)) {
      Write-Error 'TextFile nao encontrado'
      exit 1
    }
    $text = [System.IO.File]::ReadAllText($TextFile, [System.Text.Encoding]::UTF8)
    $previous = $null
    try { $previous = Get-Clipboard -Raw -ErrorAction SilentlyContinue } catch { }
    Set-Clipboard -Value $text
    Start-Sleep -Milliseconds 120
    [System.Windows.Forms.SendKeys]::SendWait('^v')
    Start-Sleep -Milliseconds 300
    if ($null -ne $previous) {
      try { Set-Clipboard -Value $previous } catch { }
    }
  }
  'keys' {
    [System.Windows.Forms.SendKeys]::SendWait($Keys)
  }
}

Start-Sleep -Milliseconds 80
Write-Output 'ok'
