/**
 * CampusTrack Unified Development Runner
 * Starts MySQL (if needed), Backend (port 5000), and Frontend (port 5173).
 */
const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => { resolve(false); });
    socket.connect(port, '127.0.0.1');
  });
}

async function main() {
  console.log('================================================================');
  console.log('   🎓 CAMPUSTRACK: Campus Lost & Found Management System');
  console.log('   DBMS Capstone Project • Starting Full-Stack Services...');
  console.log('================================================================\n');

  // 1. Check MySQL
  const dbUp = await checkPort(3307);
  if (!dbUp) {
    console.log('⚡ Launching MySQL Server 8.0 on port 3307...');
    const dbLauncher = spawn('node', ['database/start_mysql.js'], { stdio: 'inherit' });
    await new Promise(r => setTimeout(r, 4000));
  } else {
    console.log('✅ MySQL Server 8.0 is running on port 3307.');
  }

  // 2. Start Backend
  console.log('🚀 Starting Express REST API Server on port 5000...');
  const backend = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit'
  });

  // 3. Start Frontend
  console.log('⚡ Starting React + Vite Frontend on port 5173...');
  const frontend = spawn('npm.cmd', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit'
  });

  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down CampusTrack services...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}

main();
