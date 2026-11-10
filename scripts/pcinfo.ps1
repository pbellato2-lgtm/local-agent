[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'SilentlyContinue'

function Safe($sb) { try { & $sb } catch { $null } }
function Arr($x) { if ($null -eq $x) { @() } elseif ($x -is [System.Array]) { @($x) } else { @($x) } }
function GB($b) { if ($b -and $b -gt 0) { [math]::Round([double]$b / 1GB, 2) } else { 0 } }
function MB($b) { if ($b -and $b -gt 0) { [math]::Round([double]$b / 1MB, 1) } else { 0 } }
function DT($d) { if ($d) { try { ([Management.ManagementDateTimeConverter]::ToDateTime($d)).ToString('yyyy-MM-dd HH:mm:ss') } catch { try { $d.ToString() } catch { '' } } } else { '' } }

$result = [ordered]@{}
$result.collectedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
$result.errors = @()

# Visão geral / SO
$result.overview = Safe {
  $os = Get-CimInstance Win32_OperatingSystem
  $cs = Get-CimInstance Win32_ComputerSystem
  $tz = Safe { (Get-TimeZone).DisplayName }
  $boot = DT $os.LastBootUpTime
  $uptime = if ($os.LastBootUpTime) { $u = (Get-Date) - ([Management.ManagementDateTimeConverter]::ToDateTime($os.LastBootUpTime)); '{0}d {1}h {2}m' -f $u.Days,$u.Hours,$u.Minutes } else { '' }
  [ordered]@{
    hostname = $env:COMPUTERNAME
    user = $env:USERNAME
    domain = $cs.Domain
    partOfDomain = $cs.PartOfDomain
    os = $os.Caption
    osVersion = $os.Version
    build = $os.BuildNumber
    architecture = $os.OSArchitecture
    installDate = DT $os.InstallDate
    lastBoot = $boot
    uptime = $uptime
    timezone = $tz
    locale = Safe { (Get-Culture).Name }
    systemDirectory = $os.SystemDirectory
    windowsDirectory = $os.WindowsDirectory
    serialNumber = $os.SerialNumber
    registeredUser = $os.RegisteredUser
    productType = switch ($os.ProductType) { 1 {'Workstation'} 2 {'Domain Controller'} 3 {'Server'} default {$os.ProductType} }
  }
}

# CPU
$result.cpu = Safe {
  $cpus = @(Get-CimInstance Win32_Processor)
  $load = Safe { (Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average }
  $list = foreach ($c in $cpus) {
    [ordered]@{
      name = ("$($c.Name)").Trim()
      manufacturer = $c.Manufacturer
      description = $c.Description
      cores = $c.NumberOfCores
      threads = $c.NumberOfLogicalProcessors
      maxClockMHz = $c.MaxClockSpeed
      currentClockMHz = $c.CurrentClockSpeed
      socket = $c.SocketDesignation
      architecture = $c.Architecture
      l2CacheKB = $c.L2CacheSize
      l3CacheKB = $c.L3CacheSize
      virtualization = $c.VirtualizationFirmwareEnabled
      status = $c.Status
      processorId = $c.ProcessorId
    }
  }
  [ordered]@{ loadPercent = $load; count = $cpus.Count; processors = $list }
}

# Memória
$result.memory = Safe {
  $os = Get-CimInstance Win32_OperatingSystem
  $cs = Get-CimInstance Win32_ComputerSystem
  $pf = @(Get-CimInstance Win32_PageFileUsage)
  $modules = @(Get-CimInstance Win32_PhysicalMemory | ForEach-Object {
    [ordered]@{
      bank = $_.BankLabel
      device = $_.DeviceLocator
      capacityGB = GB $_.Capacity
      speedMHz = $(if ($_.ConfiguredClockSpeed) { $_.ConfiguredClockSpeed } elseif ($_.Speed) { $_.Speed } else { $null })
      manufacturer = $_.Manufacturer
      partNumber = ("$($_.PartNumber)").Trim()
      serial = $_.SerialNumber
      formFactor = $_.FormFactor
      memoryType = $_.SMBIOSMemoryType
    }
  })
  $total = [double]$cs.TotalPhysicalMemory
  $free = [double]$os.FreePhysicalMemory * 1KB
  $used = $total - $free
  [ordered]@{
    totalGB = GB $total
    freeGB = GB $free
    usedGB = GB $used
    usedPercent = if ($total -gt 0) { [math]::Round(($used/$total)*100,1) } else { 0 }
    virtualTotalGB = GB ($os.TotalVirtualMemorySize * 1KB)
    virtualFreeGB = GB ($os.FreeVirtualMemorySize * 1KB)
    pageFiles = @(foreach ($p in $pf) { [ordered]@{ name=$p.Name; allocatedMB=$p.AllocatedBaseSize; currentMB=$p.CurrentUsage; peakMB=$p.PeakUsage } })
    modules = $modules
  }
}

# Discos
$result.disks = Safe {
  $phys = @(Get-CimInstance Win32_DiskDrive | ForEach-Object {
    [ordered]@{
      model = $_.Model
      interface = $_.InterfaceType
      mediaType = $_.MediaType
      sizeGB = GB $_.Size
      serial = ("$($_.SerialNumber)").Trim()
      firmware = $_.FirmwareRevision
      partitions = $_.Partitions
      status = $_.Status
      index = $_.Index
      busType = Safe { (Get-PhysicalDisk -ErrorAction SilentlyContinue | Where-Object { $_.FriendlyName -eq $_.Model -or $_.DeviceId -eq $_.Index } | Select-Object -First 1).BusType }
    }
  })
  $vols = @(Get-CimInstance Win32_LogicalDisk | ForEach-Object {
    $type = switch ($_.DriveType) { 2 {'Removível'} 3 {'Local'} 4 {'Rede'} 5 {'CD/DVD'} default {$_.DriveType} }
    [ordered]@{
      drive = $_.DeviceID
      label = $_.VolumeName
      fileSystem = $_.FileSystem
      type = $type
      sizeGB = GB $_.Size
      freeGB = GB $_.FreeSpace
      usedPercent = if ($_.Size -gt 0) { [math]::Round((($_.Size-$_.FreeSpace)/$_.Size)*100,1) } else { $null }
    }
  })
  $volDetail = Safe { @(Get-Volume -ErrorAction SilentlyContinue | Where-Object { $_.DriveLetter } | ForEach-Object {
    [ordered]@{ drive=("$($_.DriveLetter):"); friendly=$_.FriendlyName; fs=$_.FileSystemType; health=$_.HealthStatus; sizeGB=GB($_.Size); freeGB=GB($_.SizeRemaining) }
  }) }
  [ordered]@{ physical = $phys; volumes = $vols; volumeHealth = $volDetail }
}

# GPU / Vídeo / Monitores
$result.graphics = Safe {
  $gpus = @(Get-CimInstance Win32_VideoController | ForEach-Object {
    [ordered]@{
      name = $_.Name
      adapterRAMGB = if ($_.AdapterRAM) { GB $_.AdapterRAM } else { $null }
      driverVersion = $_.DriverVersion
      driverDate = DT $_.DriverDate
      resolution = if ($_.CurrentHorizontalResolution) { "$($_.CurrentHorizontalResolution)x$($_.CurrentVerticalResolution)" } else { '' }
      refreshHz = $_.CurrentRefreshRate
      bitsPerPixel = $_.CurrentBitsPerPixel
      videoProcessor = $_.VideoProcessor
      status = $_.Status
      pnpId = $_.PNPDeviceID
    }
  })
  $mons = Safe { @(Get-CimInstance WmiMonitorID -Namespace root\wmi -ErrorAction SilentlyContinue | ForEach-Object {
    $name = if ($_.UserFriendlyName) { -join ($_.UserFriendlyName | Where-Object { $_ -ne 0 } | ForEach-Object { [char]$_ }) } else { '' }
    $man = if ($_.ManufacturerName) { -join ($_.ManufacturerName | Where-Object { $_ -ne 0 } | ForEach-Object { [char]$_ }) } else { '' }
    $serial = if ($_.SerialNumberID) { -join ($_.SerialNumberID | Where-Object { $_ -ne 0 } | ForEach-Object { [char]$_ }) } else { '' }
    [ordered]@{ name=$name; manufacturer=$man; serial=$serial; year=$_.YearOfManufacture }
  }) }
  $basic = Safe { @(Get-CimInstance Win32_DesktopMonitor -ErrorAction SilentlyContinue | ForEach-Object { [ordered]@{ name=$_.Name; screenWidth=$_.ScreenWidth; screenHeight=$_.ScreenHeight; status=$_.Status } }) }
  [ordered]@{ gpus = $gpus; monitors = $mons; monitorsBasic = $basic }
}

# Rede
$result.network = Safe {
  $adapters = @(Get-CimInstance Win32_NetworkAdapterConfiguration -ErrorAction SilentlyContinue | Where-Object { $_.IPEnabled } | ForEach-Object {
    [ordered]@{
      description = $_.Description
      mac = $_.MACAddress
      dhcp = $_.DHCPEnabled
      dhcpServer = $_.DHCPServer
      ip = @(Arr $_.IPAddress)
      subnet = @(Arr $_.IPSubnet)
      gateway = @(Arr $_.DefaultIPGateway)
      dns = @(Arr $_.DNSServerSearchOrder)
      dnsSuffix = $_.DNSDomain
    }
  })
  $phys = Safe { @(Get-NetAdapter -ErrorAction SilentlyContinue | ForEach-Object {
    [ordered]@{ name=$_.Name; interface=$_.InterfaceDescription; status=$_.Status; mac=$_.MacAddress; linkSpeed=$_.LinkSpeed; media=$_.MediaType }
  }) }
  $ip = Safe { @(Get-NetIPAddress -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notmatch '^fe80|^169\.254|^::1$|^127\.' } | Select-Object -First 30 | ForEach-Object {
    [ordered]@{ interface=$_.InterfaceAlias; address=$_.IPAddress; family=$_.AddressFamily; prefix=$_.PrefixLength }
  }) }
  $pub = Safe { (Invoke-RestMethod -Uri 'https://api.ipify.org?format=text' -TimeoutSec 2 -ErrorAction SilentlyContinue) }
  [ordered]@{ adapters = $adapters; interfaces = $phys; addresses = $ip; publicIp = $pub }
}

# Sistema / BIOS / Placa-mãe
$result.system = Safe {
  $cs = Get-CimInstance Win32_ComputerSystem
  $bb = Safe { Get-CimInstance Win32_BaseBoard }
  $bios = Safe { Get-CimInstance Win32_BIOS }
  $prod = Safe { Get-CimInstance Win32_ComputerSystemProduct }
  $enc = Safe { Get-CimInstance Win32_SystemEnclosure }
  [ordered]@{
    manufacturer = $cs.Manufacturer
    model = $cs.Model
    systemType = $cs.SystemType
    family = $cs.SystemFamily
    sku = $cs.SystemSKUNumber
    totalPhysicalMemoryGB = GB $cs.TotalPhysicalMemory
    domainRole = $cs.DomainRole
    hypervisorPresent = $cs.HypervisorPresent
    baseboard = if ($bb) { [ordered]@{ manufacturer=$bb.Manufacturer; product=$bb.Product; version=$bb.Version; serial=$bb.SerialNumber } } else { $null }
    bios = if ($bios) { [ordered]@{ vendor=$bios.Manufacturer; version=$bios.SMBIOSBIOSVersion; releaseDate=DT $bios.ReleaseDate; serial=$bios.SerialNumber; mode= if ($bios.SMBIOSPresent) {'SMBIOS'} else {''} } } else { $null }
    product = if ($prod) { [ordered]@{ name=$prod.Name; vendor=$prod.Vendor; version=$prod.Version; uuid=$prod.UUID; identifyingNumber=$prod.IdentifyingNumber } } else { $null }
    chassis = if ($enc) { [ordered]@{ manufacturer=$enc.Manufacturer; model=$enc.Model; chassisTypes=@(Arr $enc.ChassisTypes); serial=$enc.SerialNumber } } else { $null }
  }
}

# Bateria / Energia
$result.power = Safe {
  $bat = @(Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue | ForEach-Object {
    $status = switch ($_.BatteryStatus) { 1 {'Descarregando'} 2 {'AC/Carregando'} 3 {'Cheia'} 4 {'Baixa'} 5 {'Crítica'} default {$_.BatteryStatus} }
    [ordered]@{ name=$_.Name; status=$status; chargePercent=$_.EstimatedChargeRemaining; runtimeMin=$_.EstimatedRunTime; chemistry=$_.Chemistry }
  })
  $plan = Safe { (powercfg /GETACTIVESCHEME 2>$null) -join "`n" }
  [ordered]@{ batteries = $bat; activePowerPlan = $plan }
}

# Processos
$result.processes = Safe {
  $all = @(Get-Process -ErrorAction SilentlyContinue)
  $topMem = @($all | Sort-Object WorkingSet64 -Descending | Select-Object -First 20 | ForEach-Object {
    [ordered]@{ name=$_.ProcessName; pid=$_.Id; ramMB=MB $_.WorkingSet64; cpuSec=[math]::Round($_.CPU,1); threads=$_.Threads.Count; path=Safe{$_.Path} }
  })
  $topCpu = @($all | Where-Object { $_.CPU -gt 0 } | Sort-Object CPU -Descending | Select-Object -First 15 | ForEach-Object {
    [ordered]@{ name=$_.ProcessName; pid=$_.Id; cpuSec=[math]::Round($_.CPU,1); ramMB=MB $_.WorkingSet64 }
  })
  [ordered]@{ total=$all.Count; topByMemory=$topMem; topByCpu=$topCpu }
}

# Serviços
$result.services = Safe {
  $svcs = @(Get-Service -ErrorAction SilentlyContinue)
  $running = @($svcs | Where-Object { $_.Status -eq 'Running' } | Select-Object -First 80 | ForEach-Object { [ordered]@{ name=$_.Name; display=$_.DisplayName; status="$($_.Status)"; startType="$($_.StartType)" } })
  $autoStopped = @($svcs | Where-Object { $_.StartType -eq 'Automatic' -and $_.Status -ne 'Running' } | Select-Object -First 40 | ForEach-Object { [ordered]@{ name=$_.Name; display=$_.DisplayName; status="$($_.Status)" } })
  [ordered]@{ total=$svcs.Count; runningCount=($svcs | Where-Object { $_.Status -eq 'Running' }).Count; runningSample=$running; autoButStopped=$autoStopped }
}

# Dispositivos / Áudio / Impressoras
$result.devices = Safe {
  $audio = @(Get-CimInstance Win32_SoundDevice -ErrorAction SilentlyContinue | ForEach-Object { [ordered]@{ name=$_.Name; manufacturer=$_.Manufacturer; status=$_.Status } })
  $printers = @(Get-CimInstance Win32_Printer -ErrorAction SilentlyContinue | ForEach-Object { [ordered]@{ name=$_.Name; default=$_.Default; network=$_.Network; status=$_.Status; driver=$_.DriverName } })
  $usb = Safe { @(Get-PnpDevice -Class USB -PresentOnly -ErrorAction SilentlyContinue | Select-Object -First 40 | ForEach-Object { [ordered]@{ name=$_.FriendlyName; status="$($_.Status)"; instance=$_.InstanceId } }) }
  $problem = Safe { @(Get-PnpDevice -Status Error,Degraded,Unknown -ErrorAction SilentlyContinue | Select-Object -First 30 | ForEach-Object { [ordered]@{ name=$_.FriendlyName; class=$_.Class; status="$($_.Status)" } }) }
  [ordered]@{ audio=$audio; printers=$printers; usb=$usb; problemDevices=$problem }
}

# Hotfixes / Segurança
$result.security = Safe {
  $hotfix = @(Get-CimInstance Win32_QuickFixEngineering -ErrorAction SilentlyContinue | Sort-Object InstalledOn -Descending | Select-Object -First 30 | ForEach-Object { [ordered]@{ id=$_.HotFixID; description=$_.Description; installedOn=DT $_.InstalledOn } })
  $def = Safe { Get-MpComputerStatus -ErrorAction SilentlyContinue | Select-Object AMServiceEnabled,AntispywareEnabled,AntivirusEnabled,RealTimeProtectionEnabled,NISEnabled,AntivirusSignatureLastUpdated }
  $fw = Safe { @(Get-NetFirewallProfile -ErrorAction SilentlyContinue | ForEach-Object { [ordered]@{ name=$_.Name; enabled=$_.Enabled; defaultInbound="$($_.DefaultInboundAction)"; defaultOutbound="$($_.DefaultOutboundAction)" } }) }
  $av = Safe { @(Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct -ErrorAction SilentlyContinue | ForEach-Object { [ordered]@{ name=$_.displayName; state=$_.productState; path=$_.pathToSignedProductExe } }) }
  [ordered]@{ hotfixes=$hotfix; defender=$def; firewallProfiles=$fw; antivirusProducts=$av }
}

# Ambiente / Usuários
$result.environment = Safe {
  $users = @(Get-CimInstance Win32_UserAccount -Filter "LocalAccount=True" -ErrorAction SilentlyContinue | ForEach-Object { [ordered]@{ name=$_.Name; fullName=$_.FullName; disabled=$_.Disabled; lockout=$_.Lockout; sid=$_.SID } })
  $groups = Safe { @(Get-LocalGroup -ErrorAction SilentlyContinue | Select-Object -First 30 | ForEach-Object { [ordered]@{ name=$_.Name; description=$_.Description } }) }
  $env = @(Get-ChildItem Env: -ErrorAction SilentlyContinue | Sort-Object Name | ForEach-Object { [ordered]@{ name=$_.Name; value=$_.Value } })
  $paths = Safe { $env:PATH -split ';' | Where-Object { $_ } }
  [ordered]@{ localUsers=$users; localGroups=$groups; envVars=$env; pathEntries=@(Arr $paths) }
}

# Drivers (amostra)
$result.drivers = Safe {
  @(Get-CimInstance Win32_PnPSignedDriver -ErrorAction SilentlyContinue | Where-Object { $_.DeviceName } | Sort-Object DeviceName -Unique | Select-Object -First 60 | ForEach-Object {
    [ordered]@{ device=$_.DeviceName; manufacturer=$_.Manufacturer; driverVersion=$_.DriverVersion; driverDate=DT $_.DriverDate; inf=$_.InfName }
  })
}

# Startup
$result.startup = Safe {
  $cmd = @(Get-CimInstance Win32_StartupCommand -ErrorAction SilentlyContinue | ForEach-Object { [ordered]@{ name=$_.Name; command=$_.Command; location=$_.Location; user=$_.User } })
  $run = Safe { @(Get-ItemProperty 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Run','HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -ErrorAction SilentlyContinue | ForEach-Object { $_.PSObject.Properties | Where-Object { $_.Name -notmatch '^PS' } | ForEach-Object { [ordered]@{ name=$_.Name; command="$($_.Value)" } } }) }
  [ordered]@{ startupCommands=$cmd; runKeys=$run }
}

$result | ConvertTo-Json -Depth 8 -Compress