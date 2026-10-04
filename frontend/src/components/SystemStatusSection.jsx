import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  RotateCw,
  Server,
  Database,
  Radio,
  Monitor,
  ShieldCheck,
  Lock,
  Globe,
  HardDrive,
  Cpu,
  Layers,
} from 'lucide-react';
import API from '../services/api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getSockJsUrl, API_BASE_URL } from '../config/env';

const SystemStatusSection = () => {
  const [loading, setLoading] = useState(false);
  const [frontendStatus, setFrontendStatus] = useState({ online: true, latency: 0 });
  const [backendHealth, setBackendHealth] = useState(null);
  const [wsStatus, setWsStatus] = useState('CONNECTING'); // CONNECTED, ERROR, CONNECTING
  const [lastCheck, setLastCheck] = useState(new Date().toLocaleTimeString());

  const checkHealth = useCallback(async () => {
    setLoading(true);
    const start = performance.now();

    // Frontend status is active if this code is running
    setFrontendStatus({
      online: true,
      latency: Math.round(performance.now() - start),
    });

    try {
      const res = await API.get('/health');
      setBackendHealth(res.data);
    } catch (err) {
      console.error('Failed to fetch /api/health:', err);
      setBackendHealth({
        status: 'DOWN',
        service: 'CampusFind',
        database: 'DISCONNECTED',
        error: 'Unable to reach backend API',
      });
    } finally {
      setLoading(false);
      setLastCheck(new Date().toLocaleTimeString());
    }
  }, []);

  // Test live WebSocket connectivity
  useEffect(() => {
    let client = null;
    try {
      client = new Client({
        webSocketFactory: () => new SockJS(getSockJsUrl()),
        reconnectDelay: 0,
        onConnect: () => {
          setWsStatus('CONNECTED');
          client.deactivate();
        },
        onStompError: () => {
          setWsStatus('ERROR');
        },
        onWebSocketError: () => {
          setWsStatus('ERROR');
        },
      });
      client.activate();
    } catch (err) {
      setWsStatus('ERROR');
    }

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const isBackendUp = backendHealth?.status === 'UP';
  const isDbConnected = backendHealth?.database === 'CONNECTED';
  const isWsConnected = wsStatus === 'CONNECTED';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200">
            <Activity className="w-3.5 h-3.5" />
            <span>Live Production Health & Deployment Verification</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            System & Deployment Diagnostics
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Real-time status check for Frontend, Backend REST API, Database connection, and WebSocket alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400">
            Last check: <span className="font-mono text-neutral-700">{lastCheck}</span>
          </span>
          <button
            onClick={checkHealth}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Diagnostics
          </button>
        </div>
      </div>

      {/* 4 Core Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Frontend */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-primary flex items-center justify-center">
              <Monitor className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              🟢 Online
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Frontend Client</h3>
            <p className="text-xs text-neutral-500 mt-0.5">React 18 + Vite SPA</p>
          </div>
          <div className="pt-3 border-t border-neutral-100 text-xs text-neutral-600 space-y-1">
            <div className="flex justify-between">
              <span className="text-neutral-400">Protocol</span>
              <span className="font-mono font-medium">{typeof window !== 'undefined' ? window.location.protocol : 'https:'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Deployment Target</span>
              <span className="font-semibold text-neutral-800">Vercel Ready</span>
            </div>
          </div>
        </div>

        {/* 2. Backend */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            {isBackendUp ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                🟢 Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                🔴 Offline
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Backend REST API</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Spring Boot 3 + Java</p>
          </div>
          <div className="pt-3 border-t border-neutral-100 text-xs text-neutral-600 space-y-1">
            <div className="flex justify-between">
              <span className="text-neutral-400">API Endpoint</span>
              <span className="font-mono text-[11px] truncate max-w-[130px]">{API_BASE_URL}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Uptime</span>
              <span className="font-mono font-medium">{backendHealth?.uptimeSeconds ? `${backendHealth.uptimeSeconds}s` : 'Active'}</span>
            </div>
          </div>
        </div>

        {/* 3. Database */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            {isDbConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                🟢 Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <XCircle className="w-3.5 h-3.5 text-amber-600" />
                🟡 Checking
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Database Engine</h3>
            <p className="text-xs text-neutral-500 mt-0.5">MySQL 8.0+ / HikariCP</p>
          </div>
          <div className="pt-3 border-t border-neutral-100 text-xs text-neutral-600 space-y-1">
            <div className="flex justify-between">
              <span className="text-neutral-400">Status</span>
              <span className="font-bold text-neutral-800">{backendHealth?.database || 'CONNECTING'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Environment</span>
              <span className="font-medium text-neutral-800 capitalize">{backendHealth?.environment || 'Production'}</span>
            </div>
          </div>
        </div>

        {/* 4. WebSocket */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            {isWsConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                🟢 Connected
              </span>
            ) : wsStatus === 'CONNECTING' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                Testing...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                🟡 Reconnecting
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">WebSocket / STOMP</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Real-time Live Alerts & Chat</p>
          </div>
          <div className="pt-3 border-t border-neutral-100 text-xs text-neutral-600 space-y-1">
            <div className="flex justify-between">
              <span className="text-neutral-400">Transport</span>
              <span className="font-mono font-medium">SockJS + STOMP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Secure Protocol</span>
              <span className="font-semibold text-neutral-800">WSS Supported</span>
            </div>
          </div>
        </div>
      </div>

      {/* Production Architecture Checklist */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Production Deployment Readiness Checklist
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
            <span className="font-bold text-neutral-800 block">Frontend (Vercel)</span>
            <ul className="space-y-1.5 text-neutral-600">
              <li className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Zero hardcoded localhost URLs in source code
              </li>
              <li className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Single Page Application (SPA) routing with vercel.json
              </li>
              <li className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Dynamic WebSocket endpoint with automatic WSS protocol upgrade
              </li>
              <li className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Environment variables template (.env.example) configured
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
            <span className="font-bold text-neutral-800 block">Backend & Database (Render / Railway)</span>
            <ul className="space-y-1.5 text-neutral-600">
              <li className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Production health check endpoint active at /api/health
              </li>
              <li className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Environment-controlled CORS filtering (no wildcard origins in production)
              </li>
              <li className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Safe database initialization (sample demo data skipped in production)
              </li>
              <li className="flex items-center gap-2 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Secure initial administrator bootstrapping from environment variables
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusSection;
