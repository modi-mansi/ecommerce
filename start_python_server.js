#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🐍 Starting Python Flask API server...');

// Start Python Flask server
const python = spawn('python', ['flask_server.py'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

python.on('error', (err) => {
  console.error('Failed to start Python server:', err);
  process.exit(1);
});

python.on('close', (code) => {
  console.log(`Python server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  python.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Terminating...');
  python.kill('SIGTERM');
});