/**
 * Version and build information utilities
 */

export interface BuildInfo {
  version: string;
  buildTime: string;
  git: {
    commit: string;
    branch: string;
    commitMessage: string;
    commitDate: string;
    author: string;
  };
  environment: string;
  productionReady: boolean;
}

let cachedBuildInfo: BuildInfo | null = null;

/**
 * Get build information
 * Fetches from /buildInfo.json generated at build time
 */
export async function getBuildInfo(): Promise<BuildInfo> {
  if (cachedBuildInfo) {
    return cachedBuildInfo;
  }

  try {
    const response = await fetch('/buildInfo.json');
    if (!response.ok) {
      throw new Error('Failed to load build info');
    }
    cachedBuildInfo = await response.json();
    return cachedBuildInfo!;
  } catch (error) {
    console.error('Failed to load build info:', error);
    // Return fallback
    return {
      version: '1.0.0',
      buildTime: new Date().toISOString(),
      git: {
        commit: 'unknown',
        branch: 'unknown',
        commitMessage: 'unknown',
        commitDate: new Date().toISOString(),
        author: 'unknown',
      },
      environment: import.meta.env.MODE || 'production',
      productionReady: true,
    };
  }
}

/**
 * Check for application updates
 * Compares current version with latest GitHub release
 */
export async function checkForUpdates(): Promise<{
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
  releaseUrl?: string;
  releaseNotes?: string;
}> {
  try {
    const buildInfo = await getBuildInfo();
    const currentVersion = buildInfo.version;

    // Check GitHub API for latest release
    const response = await fetch(
      'https://api.github.com/repos/dantosXD/command_center/releases/latest',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check for updates');
    }

    const release = await response.json();
    const latestVersion = release.tag_name.replace(/^v/, '');

    const hasUpdate = compareVersions(currentVersion, latestVersion) < 0;

    return {
      hasUpdate,
      currentVersion,
      latestVersion,
      releaseUrl: release.html_url,
      releaseNotes: release.body,
    };
  } catch (error) {
    console.error('Failed to check for updates:', error);
    const buildInfo = await getBuildInfo();
    return {
      hasUpdate: false,
      currentVersion: buildInfo.version,
    };
  }
}

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1: string, v2: string): number {
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

/**
 * Format version string for display
 */
export function formatVersion(version: string): string {
  return version.startsWith('v') ? version : `v${version}`;
}

/**
 * Get short commit hash (7 characters)
 */
export function getShortCommit(commit: string): string {
  return commit.substring(0, 7);
}
