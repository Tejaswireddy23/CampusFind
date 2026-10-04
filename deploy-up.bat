@echo off
echo ========================================================
echo   CampusFind — Starting Unified 3-Tier Production Deploy
echo ========================================================
echo.

REM 1. Check if Docker daemon is running
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Docker Desktop is not running. Launching Docker Desktop...
    start "" "C:\Users\Admin\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe"
    echo [INFO] Waiting for Docker daemon to initialize...
    :wait_docker
    timeout /t 5 /nobreak >nul
    docker ps >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [WAIT] Waiting for Docker engine to become ready...
        goto wait_docker
    )
    echo [OK] Docker daemon is running!
)

echo.
echo [1/3] Building and starting MySQL Database, Spring Boot Backend, and Nginx Frontend...
docker compose --env-file .env.docker up --build -d

echo.
echo ========================================================
echo   CampusFind Deployment Started Successfully!
echo ========================================================
echo.
echo   Frontend (Nginx + React): http://localhost
echo   Backend REST API:         http://localhost:8081/api
echo   Backend Health Check:     http://localhost:8081/api/health
echo   Database Port:            localhost:3307
echo.
echo   Initial Campus Administrator:
echo     Email:    admin@campusfind.edu
echo     Password: Admin@123
echo ========================================================
pause
