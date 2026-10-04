@echo off
echo ========================================================
echo   CampusFind — Public Live Internet Sharing Tunnel
echo ========================================================
echo.
echo Launching Cloudflare public HTTPS tunnel for http://localhost:5173 ...
echo Anyone anywhere in the world will be able to access your portal!
echo.
.\cloudflared.exe tunnel --url http://localhost:5173
pause
