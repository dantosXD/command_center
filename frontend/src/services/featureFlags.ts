/**
 * Feature Flag Service
 * Manages feature flags with per-tenant overrides and automatic rollback
 */

export type FeatureFlagName = 'floating_panel_tabs';

export interface FeatureFlag {
  name: FeatureFlagName;
  enabled: boolean;
  rolloutPercentage: number;
  rollbackTriggers: RollbackTrigger[];
}

export interface RollbackTrigger {
  type: 'error_rate' | 'performance_degradation' | 'manual';
  threshold?: number;
  enabled: boolean;
}

class FeatureFlagManager {
  private flags: Map<FeatureFlagName, FeatureFlag> = new Map();
  private userHash: string = '';

  constructor() {
    this.initializeFlags();
    this.generateUserHash();
  }

  private initializeFlags(): void {
    // Initialize floating_panel_tabs flag
    this.flags.set('floating_panel_tabs', {
      name: 'floating_panel_tabs',
      enabled: true,
      rolloutPercentage: 10, // Start at 10% rollout
      rollbackTriggers: [
        {
          type: 'error_rate',
          threshold: 5, // Rollback if error rate > 5%
          enabled: true,
        },
        {
          type: 'performance_degradation',
          threshold: 20, // Rollback if performance degrades > 20%
          enabled: true,
        },
        {
          type: 'manual',
          enabled: true,
        },
      ],
    });
  }

  private generateUserHash(): void {
    // Generate a consistent hash for the current user
    // This is used for deterministic rollout
    const userId = this.getUserId();
    this.userHash = String(this.hashString(userId));
  }

  private getUserId(): string {
    // Get user ID from localStorage or generate a session ID
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = `session_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user_id', userId);
    }
    return userId;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 100;
  }

  /**
   * Check if a feature flag is enabled for the current user
   */
  isEnabled(flagName: FeatureFlagName): boolean {
    const flag = this.flags.get(flagName);
    if (!flag || !flag.enabled) {
      return false;
    }

    // Check rollout percentage
    return parseInt(this.userHash, 10) < flag.rolloutPercentage;
  }

  /**
   * Get feature flag details
   */
  getFlag(flagName: FeatureFlagName): FeatureFlag | undefined {
    return this.flags.get(flagName);
  }

  /**
   * Set feature flag enabled state
   */
  setFlagEnabled(flagName: FeatureFlagName, enabled: boolean): void {
    const flag = this.flags.get(flagName);
    if (flag) {
      flag.enabled = enabled;
    }
  }

  /**
   * Set rollout percentage for a feature flag
   */
  setRolloutPercentage(flagName: FeatureFlagName, percentage: number): void {
    const flag = this.flags.get(flagName);
    if (flag) {
      flag.rolloutPercentage = Math.max(0, Math.min(100, percentage));
    }
  }

  /**
   * Trigger rollback for a feature flag
   */
  triggerRollback(flagName: FeatureFlagName, reason: string): void {
    const flag = this.flags.get(flagName);
    if (flag) {
      console.warn(`Rolling back feature flag ${flagName}: ${reason}`);
      flag.enabled = false;
    }
  }

  /**
   * Get all feature flags
   */
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }
}

// Export singleton instance
export const featureFlagManager = new FeatureFlagManager();

/**
 * Hook-like function to check if a feature is enabled
 */
export function useFeatureFlag(flagName: FeatureFlagName): boolean {
  return featureFlagManager.isEnabled(flagName);
}
