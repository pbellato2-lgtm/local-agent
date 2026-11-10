param(
  [Parameter(Mandatory = $true)][string]$Out
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Stop'

try {
  Add-Type -AssemblyName System.Windows.Forms
  Add-Type -AssemblyName System.Drawing
  Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class TrojanDpi {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
}
"@
  [TrojanDpi]::SetProcessDPIAware() | Out-Null

  $bounds = [System.Windows.Forms.SystemInformation]::VirtualScreen
  $bitmap = New-Object System.Drawing.Bitmap($bounds.Width, $bounds.Height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)

  $dir = Split-Path -Parent $Out
  if (-not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }

  $bitmap.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()

  Write-Output "$($bounds.Width)x$($bounds.Height)"
}
catch {
  Write-Error $_.Exception.Message
  exit 1
}
