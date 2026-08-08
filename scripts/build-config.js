#!/usr/bin/env node
// Reads .env and writes js/config.js (gitignored) so the passcode never
// lives in a committed file. Run this after cloning, and again any time
// you change .env, before serving the app.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const outPath = path.join(root, 'js', 'config.js');

if (!fs.existsSync(envPath)) {
  console.error('Missing .env — copy .env.example to .env and set PASSCODE first.');
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

if (!env.PASSCODE) {
  console.error('PASSCODE is not set in .env');
  process.exit(1);
}

const out = `// Auto-generated from .env by scripts/build-config.js — do not edit, do not commit.
const PASSCODE = ${JSON.stringify(env.PASSCODE)};
`;

fs.writeFileSync(outPath, out);
console.log('Wrote js/config.js from .env');
