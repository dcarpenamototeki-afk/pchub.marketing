$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$url = 'http://localhost:3000'
try { $response = Invoke-WebRequest "$url/login" -TimeoutSec 2 -UseBasicParsing } catch { $response = $null }
if (-not $response) {
    $node = (Get-Command node.exe).Source
    $next = Join-Path $PSScriptRoot 'node_modules\next\dist\bin\next'
    if (-not (Test-Path $next)) { throw 'Dependencies are missing. Install the project dependencies first.' }
    New-Item -ItemType Directory -Force (Join-Path $PSScriptRoot 'work') | Out-Null
    $server = Start-Process -FilePath $node -ArgumentList @(('"{0}"' -f $next), 'start', '--hostname', '127.0.0.1', '--port', '3000') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $PSScriptRoot 'work\server.log') -RedirectStandardError (Join-Path $PSScriptRoot 'work\server-error.log') -PassThru
    $server.Id | Set-Content (Join-Path $PSScriptRoot 'work\server.pid')
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Seconds 1
        try { Invoke-WebRequest "$url/login" -TimeoutSec 2 -UseBasicParsing | Out-Null; $ready = $true; break } catch {}
        if ($server.HasExited) { break }
    }
    if (-not $ready) { throw 'Server could not start. See work\server-error.log.' }
}
Start-Process $url
