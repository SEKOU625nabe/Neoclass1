@echo off
REM Serveur local Neoclass Mobile
title Neoclass - Serveur Local
color 0A
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║       NEOCLASS MOBILE - SERVEUR LOCAL                      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Vérifie que Node.js est installé
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERREUR: Node.js n'est pas installé!
    echo Téléchargez depuis: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js détecté
echo.
echo 🚀 Démarrage du serveur local...
echo.

REM Démarre le serveur
node server.js

pause
