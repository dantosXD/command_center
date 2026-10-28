#!/usr/bin/env node
/**
 * Check for application updates
 * Compares current version with latest from GitHub releases
 */

import https from 'https';

const GITHUB_REPO = 'dantosXD/command_center';
const CURRENT_VERSION = process.env.npm_package_version || '1.0.0';

async function getLatestRelease() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/releases/latest`,
      headers: {
        'User-Agent': 'Command-Center-Updater',
      },
    };

    https
      .get(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const release = JSON.parse(data);
            resolve(release);
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', reject);
  });
}

function compareVersions(v1, v2) {
  const parts1 = v1.replace(/^v/, '').split('.').map(Number);
  const parts2 = v2.replace(/^v/, '').split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

async function checkForUpdates() {
  try {
    console.log(`🔍 Checking for updates (current: v${CURRENT_VERSION})...`);

    const release = await getLatestRelease();
    const latestVersion = release.tag_name.replace(/^v/, '');

    console.log(`\n📦 Latest version: v${latestVersion}`);
    console.log(`📌 Current version: v${CURRENT_VERSION}`);

    const comparison = compareVersions(CURRENT_VERSION, latestVersion);

    if (comparison < 0) {
      console.log('\n✨ New update available!');
      console.log(`\n${release.name}`);
      console.log(`\n${release.body}`);
      console.log(`\n🔗 Download: ${release.html_url}`);
      process.exit(1); // Exit with code 1 to signal update available
    } else if (comparison === 0) {
      console.log('\n✅ You are running the latest version');
      process.exit(0);
    } else {
      console.log('\n🚀 You are running a pre-release version');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Failed to check for updates:', error.message);
    process.exit(0); // Don't fail build if update check fails
  }
}

checkForUpdates();
