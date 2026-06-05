param(
  [ValidateSet('edge','chrome')]
  [string]$Browser = 'edge',
  [int]$Port = 5500
)

$workspace = Split-Path -Parent $PSScriptRoot
$url = "http://127.0.0.1:$Port/index.html"

$listening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $listening) {
  Start-Process -FilePath py -ArgumentList '-3','-m','http.server',"$Port" -WorkingDirectory $workspace | Out-Null
  Start-Sleep -Seconds 2
}

if ($Browser -eq 'chrome') {
  $exe = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
} else {
  $exe = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
}

Start-Process -FilePath $exe -ArgumentList $url | Out-Null
Write-Output "Opened $url in $Browser"
