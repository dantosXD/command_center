#!/usr/bin/env node
/**
 * Generate version information for the build
 * Creates a buildInfo.json file with version, build time, and git info
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

const buildInfo = {
  version: process.env.npm_package_version || '1.0.0',
  buildTime: new Date().toISOString(),
  git: {
    commit: exec('git rev-parse HEAD'),
    branch: exec('git rev-parse --abbrev-ref HEAD'),
    commitMessage: exec('git log -1 --pretty=%B'),
    commitDate: exec('git log -1 --pretty=%cI'),
    author: exec('git log -1 --pretty=%an'),
  },
  environment: process.env.NODE_ENV || 'production',
  productionReady: true,
};

// Write to frontend/static for SvelteKit
const outputPath = resolve(__dirname, '../frontend/static/buildInfo.json');
writeFileSync(outputPath, JSON.stringify(buildInfo, null, 2));

console.log('✅ Build info generated:');
console.log(`   Version: ${buildInfo.version}`);
console.log(`   Commit: ${buildInfo.git.commit.substring(0, 7)}`);
console.log(`   Branch: ${buildInfo.git.branch}`);
console.log(`   Time: ${buildInfo.buildTime}`);
console.log(`   File: ${outputPath}`);
