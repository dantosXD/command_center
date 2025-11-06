/**
 * usePanelStorage Hook
 * Manages floating panel state persistence to localStorage
 */

import { useState, useEffect, useCallback } from 'react';
import type { PanelState } from '../types/panel';
import { DEFAULT_PANEL_STATE, loadPanelState, savePanelState } from '../services/panelApi';

export function usePanelStorage() {
  const [panelState, setPanelState] = useState<PanelState>(DEFAULT_PANEL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Load panel state from localStorage on mount
   */
  useEffect(() => {
    try {
      const savedState = loadPanelState();
      setPanelState(savedState);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading panel state:', error);
      setIsLoaded(true);
    }
  }, []);

  /**
   * Update panel state and save to localStorage
   */
  const updatePanelState = useCallback((updates: Partial<PanelState>) => {
    setPanelState((prev) => {
      const newState: PanelState = {
        ...prev,
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      savePanelState(newState);
      return newState;
    });
  }, []);

  /**
   * Update panel position
   */
  const updatePosition = useCallback(
    (x: number, y: number) => {
      updatePanelState({
        position: { x, y },
      });
    },
    [updatePanelState]
  );

  /**
   * Toggle minimized state
   */
  const toggleMinimized = useCallback(() => {
    setPanelState((prev) => {
      const newState: PanelState = {
        ...prev,
        minimized: !prev.minimized,
        lastUpdated: new Date().toISOString(),
      };
      savePanelState(newState);
      return newState;
    });
  }, []);

  /**
   * Set active tab
   */
  const setActiveTab = useCallback(
    (tab: 'notifications' | 'reminders' | 'tasks') => {
      updatePanelState({
        activeTab: tab,
      });
    },
    [updatePanelState]
  );

  /**
   * Reset to default state
   */
  const resetState = useCallback(() => {
    const newState: PanelState = {
      ...DEFAULT_PANEL_STATE,
      lastUpdated: new Date().toISOString(),
    };
    setPanelState(newState);
    savePanelState(newState);
  }, []);

  return {
    panelState,
    isLoaded,
    updatePanelState,
    updatePosition,
    toggleMinimized,
    setActiveTab,
    resetState,
  };
}
