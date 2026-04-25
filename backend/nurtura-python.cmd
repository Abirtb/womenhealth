@echo off
setlocal
set "PY312=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
set "PY311=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
if exist "%PY312%" (
  "%PY312%" %*
  exit /b %ERRORLEVEL%
)
if exist "%PY311%" (
  "%PY311%" %*
  exit /b %ERRORLEVEL%
)
echo Real Python not found. Install from https://www.python.org/downloads/
echo Or edit this file to point to your python.exe
exit /b 1
