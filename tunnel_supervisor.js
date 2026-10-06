// CampusFind Tunnel Supervisor & Keep-Alive Daemon
// Keeps localtunnel running on subdomain 'campusfind-api-2026' and sends heartbeats.

const { spawn } = require('child_process');
const https = require('https');

const SUBDOMAIN = 'campusfind-api-2026';
const PORT = 8081;
const HEALTH_URL = `https://${SUBDOMAIN}.loca.lt/api/health`;

let tunnelProcess = null;
let isStopping = false;

function startTunnel() {
  if (isStopping) return;

  console.log(`[Supervisor] Launching localtunnel for port ${PORT} on subdomain ${SUBDOMAIN}...`);
  tunnelProcess = spawn('npx.cmd', ['-y', 'localtunnel', '--port', PORT.toString(), '--subdomain', SUBDOMAIN], {
    stdio: 'pipe',
    shell: true
  });

  tunnelProcess.stdout.on('data', (data) => {
    const text = data.toString();
    console.log(`[Tunnel STDOUT] ${text.trim()}`);
  });

  tunnelProcess.stderr.on('data', (data) => {
    const text = data.toString();
    console.warn(`[Tunnel STDERR] ${text.trim()}`);
  });

  tunnelProcess.on('close', (code) => {
    console.warn(`[Supervisor] Localtunnel process exited with code ${code}. Restarting in 5s...`);
    tunnelProcess = null;
    if (!isStopping) {
      setTimeout(startTunnel, 5000);
    }
  });

  tunnelProcess.on('error', (err) => {
    console.error(`[Supervisor] Process error:`, err.message);
  });
}

function pingHealth() {
  const req = https.get(HEALTH_URL, {
    headers: {
      'bypass-tunnel-reminder': 'true',
      'User-Agent': 'CampusFind-Supervisor/1.0'
    },
    timeout: 8000
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`[Supervisor Heartbeat] OK (200) at ${new Date().toISOString()}`);
      } else {
        console.warn(`[Supervisor Heartbeat] Status ${res.statusCode} at ${new Date().toISOString()}`);
      }
    });
  });

  req.on('timeout', () => {
    req.destroy();
    console.warn(`[Supervisor Heartbeat] Ping timed out at ${new Date().toISOString()}`);
  });

  req.on('error', (err) => {
    console.warn(`[Supervisor Heartbeat] Ping error at ${new Date().toISOString()}: ${err.message}`);
  });
}

process.on('SIGINT', () => {
  isStopping = true;
  if (tunnelProcess) tunnelProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  isStopping = true;
  if (tunnelProcess) tunnelProcess.kill();
  process.exit(0);
});

// Since task-4171 is currently running localtunnel, start the heartbeat loop.
// If task-4171 ever stops, startTunnel() can be invoked.
setInterval(pingHealth, 20000);
pingHealth();
