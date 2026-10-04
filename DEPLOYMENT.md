# CampusFind — Production Deployment Guide

This guide provides step-by-step instructions for deploying the **CampusFind** application to production using modern cloud providers:
- **Frontend**: [Vercel](https://vercel.com) (React 18 + Vite SPA)
- **Backend**: [Render](https://render.com) or [Railway](https://railway.app) (Spring Boot 3 + Java 21)
- **Database**: Managed MySQL (Railway MySQL, Render MySQL, Aiven, or AWS RDS)
- **Real-Time Live Alerts**: Spring Boot WebSocket STOMP over secure WSS

---

## 📑 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup](#2-local-development-setup)
3. [Production Database Setup (MySQL)](#3-production-database-setup-mysql)
4. [Backend Deployment (Render / Railway)](#4-backend-deployment-render--railway)
5. [Frontend Deployment (Vercel)](#5-frontend-deployment-vercel)
6. [WebSocket & STOMP Production Configuration (WSS)](#6-websocket--stomp-production-configuration-wss)
7. [CORS Configuration](#7-cors-configuration)
8. [File & Image Storage Configuration](#8-file--image-storage-configuration)
9. [Initial Administrator Account Setup](#9-initial-administrator-account-setup)
10. [Health Check & Diagnostics Verification](#10-health-check--diagnostics-verification)
11. [Production Environment Variables Reference](#11-production-environment-variables-reference)

---

## 1. Prerequisites
- **Git** installed and repository pushed to GitHub.
- **Node.js 18+** & **npm 9+**
- **Java 17 or 21 JDK** & **Maven 3.8+**
- A **Vercel** account for frontend hosting.
- A **Render** or **Railway** account for backend hosting.
- A cloud **MySQL 8.0+** instance.

---

## 2. Local Development Setup

### Backend (Spring Boot)
```bash
cd backend
mvn clean spring-boot:run
```
Backend starts on `http://localhost:8081`.

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend starts on `http://localhost:5173` and proxies `/api`, `/uploads`, and `/ws` to `http://localhost:8081`.

---

## 3. Production Database Setup (MySQL)

1. Provision a MySQL 8.0+ database instance on **Railway**, **Render**, **Aiven**, or **AWS RDS**.
2. Note your connection details:
   - Host: `your-db-host.com`
   - Port: `3306`
   - Database: `campusfind_db`
   - Username: `your_username`
   - Password: `your_password`
3. Execute the initial production schema:
   ```bash
   mysql -h your-db-host.com -u your_username -p campusfind_db < database/production_schema.sql
   ```
4. Seed the initial 14 master campus locations and 14 item categories:
   ```bash
   mysql -h your-db-host.com -u your_username -p campusfind_db < database/production_seed.sql
   ```
   *(Note: Production seed data does NOT insert dummy student accounts or fake reports).*

---

## 4. Backend Deployment (Render / Railway)

### Option A: Deploy on Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** ⟶ **Web Service**.
3. Connect your GitHub repository.
4. Set the following configuration:
   - **Root Directory**: `backend`
   - **Environment**: `Docker` (uses `backend/Dockerfile`)
   - **Instance Type**: Starter or Standard
5. Add the following **Environment Variables** in Render:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | `jdbc:mysql://your-db-host.com:3306/campusfind_db?useSSL=true&requireSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8` |
   | `DATABASE_USERNAME` | `<your-db-username>` |
   | `DATABASE_PASSWORD` | `<your-db-password>` |
   | `JWT_SECRET` | `<generate-a-random-64-character-hex-string>` |
   | `FRONTEND_URL` | `https://your-campusfind.vercel.app` |
   | `CORS_ALLOWED_ORIGINS` | `https://your-campusfind.vercel.app` |
   | `INITIAL_ADMIN_EMAIL` | `admin@campusfind.edu` |
   | `INITIAL_ADMIN_PASSWORD` | `<your-strong-admin-password>` |
   | `CAMPUSFIND_SEED_SAMPLE_DATA` | `false` |
   | `STORAGE_TYPE` | `LOCAL` |
6. Click **Create Web Service**.
7. Note your public backend URL: `https://campusfind-backend.onrender.com`.

### Option B: Deploy on Railway
1. Log in to [Railway](https://railway.app).
2. Click **New Project** ⟶ **Deploy from GitHub repo**.
3. Select your repository and specify `backend` as the root directory.
4. Add the MySQL plugin or connect your external database.
5. Set environment variables identical to the table above.
6. Generate a public domain under **Settings** ⟶ **Networking**.

---

## 5. Frontend Deployment (Vercel)

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** ⟶ **Project**.
3. Import your GitHub repository.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add the **Environment Variables**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://campusfind-backend.onrender.com/api` |
   | `VITE_WS_URL` | `wss://campusfind-backend.onrender.com/ws` |
   | `VITE_SUPPORT_EMAIL` | `admin@campusfind.edu` |
6. Click **Deploy**.
7. The included [`vercel.json`](file:///c:/Users/Admin/OneDrive/Desktop/FSD%20-2%20project/frontend/vercel.json) automatically handles SPA route rewrites for client-side navigation.

---

## 6. WebSocket & STOMP Production Configuration (WSS)

- In development, the client connects to `ws://localhost:8081/ws`.
- In production, when the frontend is served over HTTPS (`https://...`), browser security requires secure WebSockets (`wss://`).
- The frontend dynamically translates `VITE_WS_URL=wss://campusfind-backend.onrender.com/ws` to `https://campusfind-backend.onrender.com/ws` for the SockJS handshake and initiates STOMP over secure TLS.

---

## 7. CORS Configuration
In production, Spring Boot enforces strict CORS origin checks:
- Set `CORS_ALLOWED_ORIGINS=https://your-campusfind.vercel.app`
- Wildcard `*` origins are automatically rejected in production when cookies/credentials are transmitted.
- Both REST endpoints and WebSocket handshake endpoints (`/ws`) enforce these origins.

---

## 8. File & Image Storage Configuration
- **Development**: Local disk storage under `./uploads`.
- **Production on Render/Railway**: Render persistent disks can be mounted to `/app/uploads`.
- **Validation**: Uploaded images are validated for:
  - Allowed types: JPEG, PNG, WEBP, GIF
  - Maximum size: 10MB
  - Path traversal protection (`..` characters rejected)
  - Random UUID-based sanitized filenames

---

## 9. Initial Administrator Account Setup
- In production, no default passwords or hardcoded test admins are ever committed.
- On first startup, if no administrator exists in the database, `DataInitializer` automatically creates the administrator specified by:
  - `INITIAL_ADMIN_EMAIL`
  - `INITIAL_ADMIN_PASSWORD`
  - `INITIAL_ADMIN_NAME`
  - `INITIAL_ADMIN_STUDENT_ID`
- After logging in, the administrator can manage student approvals, locations, reports, and alerts from the `/admin` portal.

---

## 10. Health Check & Diagnostics Verification

### Health Check Endpoint
Test your deployed backend:
```bash
curl https://campusfind-backend.onrender.com/api/health
```
Response:
```json
{
  "service": "CampusFind",
  "version": "1.0.0",
  "status": "UP",
  "database": "CONNECTED",
  "environment": "production",
  "uptimeSeconds": 120,
  "timestamp": "2026-10-04T15:30:00Z"
}
```

### System Diagnostics Page
Authorized administrators can navigate to:
`https://your-campusfind.vercel.app/admin/system-status`
To view live latency, backend status, database connection, and WebSocket handshake status in real-time.
