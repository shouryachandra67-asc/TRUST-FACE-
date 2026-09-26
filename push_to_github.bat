@echo off
title Push TrustFace AI to GitHub
echo ======================================================================
echo  TrustFace AI - Pushing Codebase to GitHub
echo  Target: https://github.com/shouryachandra67-asc/TRUST-FACE-.git
echo ======================================================================
set "PATH=C:\Users\Ev0fo\AppData\Local\Programs\MinGit\cmd;C:\Users\Ev0fo\AppData\Local\Programs\GitCredentialManager;%PATH%"

echo.
echo Launching Git Push... If prompted, sign in via browser or enter GitHub Personal Access Token.
echo.
git.exe push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ======================================================================
    echo  SUCCESS! TrustFace AI was successfully pushed to GitHub!
    echo ======================================================================
) else (
    echo.
    echo Push did not complete. Please check credentials above.
)
echo.
pause
