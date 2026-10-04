/**
 * CampusFind Centralized Environment & URL Configuration
 * Handles seamless switching between local development and production deployment.
 */

// Centralized API Base URL (defaults to '/api' for Vite dev proxy, or uses VITE_API_URL for production)
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

// Backend Root Origin (without trailing /api) for serving uploads and assets
export const BACKEND_ROOT_URL = (() => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  }
  return ''; // Relative path in development (proxied by Vite)
})();

/**
 * Returns the proper SockJS endpoint URL for STOMP clients.
 * SockJS expects HTTP/HTTPS protocols (e.g., https://backend.domain.com/ws).
 */
export const getSockJsUrl = () => {
  const configuredWs = import.meta.env.VITE_WS_URL;
  if (configuredWs) {
    // If configured as wss://, convert to https:// for SockJS HTTP handshake
    if (configuredWs.startsWith('wss://')) {
      return configuredWs.replace('wss://', 'https://');
    }
    if (configuredWs.startsWith('ws://')) {
      return configuredWs.replace('ws://', 'http://');
    }
    return configuredWs;
  }

  // If VITE_API_URL is configured, use its base + /ws
  if (BACKEND_ROOT_URL) {
    return `${BACKEND_ROOT_URL}/ws`;
  }

  // Local development fallback through Vite proxy
  return '/ws';
};

/**
 * Returns native WebSocket URL (wss:// or ws://).
 */
export const getNativeWebSocketUrl = () => {
  const configuredWs = import.meta.env.VITE_WS_URL;
  if (configuredWs) {
    if (configuredWs.startsWith('https://')) {
      return configuredWs.replace('https://', 'wss://');
    }
    if (configuredWs.startsWith('http://')) {
      return configuredWs.replace('http://', 'ws://');
    }
    return configuredWs;
  }

  if (BACKEND_ROOT_URL) {
    const isHttps = BACKEND_ROOT_URL.startsWith('https:');
    const host = BACKEND_ROOT_URL.replace(/^https?:\/\//, '');
    return `${isHttps ? 'wss:' : 'ws:'}//${host}/ws`;
  }

  // Fallback to current browser location
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    return `${isHttps ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
  }

  return 'ws://localhost:8081/ws';
};

/**
 * Safe Image & File Asset URL resolver.
 * Handles absolute URLs, data URIs, and backend-relative uploaded files.
 */
export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_ROOT_URL}${cleanPath}`;
};

export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'Contact your campus administrator for support.';
