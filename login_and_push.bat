@echo off
title TrustFace AI - GitHub One-Click Login & Push
echo ======================================================================
echo  TrustFace AI - Authenticate & Push to GitHub
echo  Repository: https://github.com/shouryachandra67-asc/TRUST-FACE-.git
echo ======================================================================
set "PATH=C:\Users\Ev0fo\AppData\Local\Programs\MinGit\cmd;%PATH%"

echo.
echo [1/3] Launching GitHub Browser Authentication...
gh.exe auth login -h github.com -p https -w

echo.
echo [2/3] Configuring Git Credential Authentication...
gh.exe auth setup-git

echo.
echo [3/3] Pushing all TrustFace AI files to main branch...
git.exe push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ======================================================================
    echo  SUCCESS! Your GitHub repository is now completely updated!
    echo  View at: https://github.com/shouryachandra67-asc/TRUST-FACE-
    echo ======================================================================
) else (
    echo.
    echo Push failed. Please check error output above.
)
echo.
pause
