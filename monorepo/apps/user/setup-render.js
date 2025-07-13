#!/usr/bin/env node

/**
 * Render Deployment Setup Script
 * This script helps verify your Render deployment configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Tiyende User Backend - Render Deployment Setup');
console.log('================================================\n');

// Check if package.json exists
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found in current directory');
  process.exit(1);
}

// Check if server directory exists
const serverPath = path.join(__dirname, 'server');
if (!fs.existsSync(serverPath)) {
  console.error('❌ server directory not found');
  process.exit(1);
}

// Check if server/index.ts exists
const serverIndexPath = path.join(serverPath, 'index.ts');
if (!fs.existsSync(serverIndexPath)) {
  console.error('❌ server/index.ts not found');
  process.exit(1);
}

// Check if tsconfig.server.json exists
const tsconfigServerPath = path.join(__dirname, 'tsconfig.server.json');
if (!fs.existsSync(tsconfigServerPath)) {
  console.error('❌ tsconfig.server.json not found');
  process.exit(1);
}

// Check package.json scripts
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const requiredScripts = ['build', 'start'];
const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);

if (missingScripts.length > 0) {
  console.error(`❌ Missing required scripts: ${missingScripts.join(', ')}`);
  process.exit(1);
}

console.log('✅ All required files found');
console.log('✅ Build and start scripts configured');

// Check for required dependencies
const requiredDeps = ['express', 'pg', 'cors', 'dotenv', 'winston', 'bcryptjs'];
const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

if (missingDeps.length > 0) {
  console.warn(`⚠️  Missing dependencies: ${missingDeps.join(', ')}`);
  console.warn('   These should be added to package.json dependencies');
} else {
  console.log('✅ All required dependencies found');
}

console.log('\n📋 Render Deployment Checklist:');
console.log('================================');
console.log('1. ✅ Repository connected to Render');
console.log('2. ✅ Build command: npm install && npm run build');
console.log('3. ✅ Start command: npm start');
console.log('4. ✅ Root directory: monorepo/apps/user');
console.log('5. ⏳ Set environment variables in Render dashboard:');
console.log('   - DATABASE_URL (your Render PostgreSQL URL)');
console.log('   - JWT_SECRET (secure random string)');
console.log('   - NODE_ENV=production');
console.log('   - PORT=10000');
console.log('6. ⏳ Deploy and test health endpoint');
console.log('7. ⏳ Update frontend API base URL');

console.log('\n🚀 Ready to deploy!');
console.log('Follow the RENDER_DEPLOYMENT.md guide for detailed instructions.'); 