# Dot-source this in PowerShell so `python` and `pip` work in the current session:
#   cd C:\Users\DELL\Desktop\Nurtura\backend
#   . .\use-python.ps1
#
# Then: python -m pip install -r requirements.txt
#       python manage.py migrate
#       python manage.py createsuperuser
#       python manage.py runserver
#
# CMD users (no PATH fix needed): .\nurtura-python.cmd -m pip install -r requirements.txt

$root = Join-Path $env:LOCALAPPDATA "Programs\Python"
if (-not (Test-Path $root)) {
    Write-Error "No Python found under $root. Install from https://www.python.org/downloads/ (check 'Add python.exe to PATH')."
    return
}

$pyHome = Get-ChildItem $root -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '^Python3\d+$' } |
    Sort-Object { [int]($_.Name -replace '\D', '') } -Descending |
    Select-Object -First 1

if (-not $pyHome) {
    Write-Error "No Python 3 folder under $root"
    return
}

$pyDir = $pyHome.FullName
$scripts = Join-Path $pyDir "Scripts"
$env:PATH = "$pyDir;$scripts;$env:PATH"
Write-Host "Using: $(Join-Path $pyDir 'python.exe')"
& (Join-Path $pyDir "python.exe") --version
