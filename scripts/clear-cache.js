#!/usr/bin/env node

/**
 * Cache Clearing Script for National Mini Mart POS
 * Run this script to clear build cache and force browser refresh
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing cache and build files...');

// Clear Next.js cache
const nextCache = path.join(process.cwd(), '.next');
if (fs.existsSync(nextCache)) {
  fs.rmSync(nextCache, { recursive: true, force: true });
  console.log('✅ Cleared .next cache');
}

// Clear node_modules cache
const nodeModulesCache = path.join(process.cwd(), 'node_modules/.cache');
if (fs.existsSync(nodeModulesCache)) {
  fs.rmSync(nodeModulesCache, { recursive: true, force: true });
  console.log('✅ Cleared node_modules cache');
}

console.log('\n🚀 Cache cleared! Now run:');
console.log('npm run dev');
console.log('\n💡 For browser cache issues:');
console.log('1. Press Ctrl+Shift+R (hard refresh)');
console.log('2. Or open Developer Tools → Network → Disable cache');
console.log('3. Or use incognito/private mode'); 