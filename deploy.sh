#!/usr/bin/env bash
# ========================================================
# CampusFind — Unified 3-Tier Production Deploy Script
# Usage: ./deploy.sh [up|down|restart|logs]
# ========================================================

ACTION=${1:-up}

case "$ACTION" in
    up)
        echo "Building and starting CampusFind 3-tier production stack..."
        docker compose --env-file .env.docker up --build -d
        echo ""
        echo "CampusFind Stack running:"
        echo "- Frontend: http://localhost (Port 80)"
        echo "- Backend:  http://localhost:8081"
        echo "- Health:   http://localhost:8081/api/health"
        echo "- MySQL:    localhost:3307"
        ;;
    down)
        echo "Stopping CampusFind production stack..."
        docker compose down
        ;;
    restart)
        echo "Restarting CampusFind production stack..."
        docker compose restart
        ;;
    logs)
        docker compose logs -f
        ;;
    *)
        echo "Usage: ./deploy.sh [up|down|restart|logs]"
        exit 1
        ;;
esac
