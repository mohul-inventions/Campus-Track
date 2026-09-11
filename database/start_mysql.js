/**
 * CampusTrack Dedicated MySQL 8.0 Server Launcher
 * Launches official mysqld.exe on dedicated port 3307 with isolated datadir.
 */
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

const MYSQLD_PATH = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqld.exe';
const DATA_DIR = path.join(__dirname, 'mysql_data');
const PORT = 3307;

function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true); // Port is open
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

async function start() {
  console.log('⚡ Checking MySQL 8.0 instance on port 3307...');

  const isRunning = await checkPort(PORT);
  if (isRunning) {
    console.log(`✅ MySQL Server 8.0 is ALREADY running on port ${PORT}.`);
    return;
  }

  // 1. Initialize data directory if not present
  if (!fs.existsSync(DATA_DIR)) {
    console.log(`📦 Initializing dedicated MySQL data directory at: ${DATA_DIR}...`);
    fs.mkdirSync(DATA_DIR, { recursive: true });
    try {
      execSync(`"${MYSQLD_PATH}" --no-defaults --initialize-insecure --datadir="${DATA_DIR}" --console`, {
        stdio: 'inherit'
      });
      console.log('✅ Data directory initialized.');
    } catch (err) {
      console.error('❌ Failed to initialize data directory:', err.message);
      process.exit(1);
    }
  }

  // 2. Start mysqld server
  console.log(`🚀 Starting MySQL Server 8.0 on port ${PORT}...`);
  const serverProcess = spawn(
    MYSQLD_PATH,
    ['--no-defaults', `--datadir=${DATA_DIR}`, `--port=${PORT}`, '--console'],
    { detached: true, stdio: 'ignore' }
  );

  serverProcess.unref();

  // 3. Wait for server to become ready
  let attempts = 0;
  while (attempts < 15) {
    await new Promise((r) => setTimeout(r, 1000));
    const ready = await checkPort(PORT);
    if (ready) {
      console.log(`🎉 MySQL Server 8.0 is UP and listening on 127.0.0.1:${PORT}!`);
      return;
    }
    attempts++;
  }

  console.error('❌ Timed out waiting for MySQL Server to start on port', PORT);
  process.exit(1);
}

start();
