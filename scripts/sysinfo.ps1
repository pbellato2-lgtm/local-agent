[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Stop'

try {
  $os = Get-CimInstance Win32_OperatingSystem
  $computer = Get-CimInstance Win32_ComputerSystem
  $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
  $gpus = Get-CimInstance Win32_VideoController | Select-Object -ExpandProperty Name

  $disks = @(
    Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3' | ForEach-Object {
      [pscustomobject]@{
        drive    = $_.DeviceID
        total_gb = [math]::Round($_.Size / 1GB, 1)
        free_gb  = [math]::Round($_.FreeSpace / 1GB, 1)
      }
    }
  )

  $processes = @(
    Get-Process | Sort-Object -Property WorkingSet64 -Descending | Select-Object -First 8 | ForEach-Object {
      [pscustomobject]@{
        name   = $_.ProcessName
        pid    = $_.Id
        ram_mb = [math]::Round($_.WorkingSet64 / 1MB, 1)
      }
    }
  )

  [pscustomobject]@{
    hostname       = $env:COMPUTERNAME
    user           = $env:USERNAME
    os             = $os.Caption
    version        = $os.Version
    arch           = $os.OSArchitecture
    cpu            = "$($cpu.Name)".Trim()
    cores          = $cpu.NumberOfCores
    threads        = $cpu.NumberOfLogicalProcessors
    ram_total_gb   = [math]::Round($computer.TotalPhysicalMemory / 1GB, 1)
    ram_free_gb    = [math]::Round($os.FreePhysicalMemory / 1MB, 1)
    uptime_hours   = [math]::Round(((Get-Date) - $os.LastBootUpTime).TotalHours, 1)
    gpu            = ($gpus -join ', ')
    disks          = $disks
    top_processes  = $processes
  } | ConvertTo-Json -Depth 5 -Compress
}
catch {
  Write-Error $_.Exception.Message
  exit 1
}
