@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
set "EXE_NAME=EngineeringIntelligence.exe"
set "EXE_PATH="

for /r "%SCRIPT_DIR%" %%F in ("%EXE_NAME%") do (
  set "EXE_PATH=%%~fF"
  goto :FOUND
)

echo [Engineering Intelligence] Unable to find %EXE_NAME% under:
echo %SCRIPT_DIR%
echo.
echo Make sure this launcher is placed inside the extracted reviewer package folder.
pause
exit /b 1

:FOUND
echo [Engineering Intelligence] Launching:
echo %EXE_PATH%
start "Engineering Intelligence" "%EXE_PATH%"
endlocal
exit /b 0
