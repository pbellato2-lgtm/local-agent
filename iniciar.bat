@echo off
cd /d "%~dp0"
if not exist "Trojan.exe" (
    echo ERRO: Trojan.exe nao encontrado nesta pasta.
    pause
    exit /b 1
)
wscript "%~dp0iniciar.vbs"
exit /b 0
