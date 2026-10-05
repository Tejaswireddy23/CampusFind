// CampusFind Cloudflare Tunnel Keep-Alive Daemon
// Sends a periodic health ping every 20 seconds to prevent edge idle timeouts

const https = require('https');

const TUNNEL_URL = 'https://optimize-visitor-endless-expenditure.trycloudflare.com/api/health';
const INTERVAL_MS = 20000; // 20 seconds

console.log(`[Keep-Alive] Starting tunnel keep-alive daemon for: ${TUNNEL_URL}`);

function ping() {
  const req = https.get(TUNNEL_URL, { timeout: 10000 }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        // Keep-alive OK
      } else {
        console.warn(`[Keep-Alive] Warning: Received status ${res.statusCode} at ${new Date().toISOString()}`);
      }
    });
  });

  req.on('timeout', () => {
    req.destroy();
    console.error(`[Keep-Alive] Request timed out at ${new Date().toISOString()}`);
  });

  req.on('error', (err) => {
    console.error(`[Keep-Alive] Ping error at ${new Date().toISOString()}:`, err.message);
  });
}

// Initial ping then run on interval
ping();
setInterval(ping, INTERVAL_MS);
