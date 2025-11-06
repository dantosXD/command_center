/**
 * usePanelPosition Hook
 * Manages floating panel position and drag logic
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface Position {
  x: number;
  y: number;
}

const DRAG_DEBOUNCE_MS = 16; // ~60fps
const MIN_X = 0;
const MIN_Y = 0;

export function usePanelPosition(initialPosition: Position = { x: 20, y: 20 }) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Get viewport dimensions
   */
  const getViewportDimensions = useCallback(() => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }, []);

  /**
   * Clamp position to viewport bounds
   */
  const clampPosition = useCallback(
    (x: number, y: number, panelWidth: number = 384, panelHeight: number = 384) => {
      const { width, height } = getViewportDimensions();
      return {
        x: Math.max(MIN_X, Math.min(x, width - panelWidth)),
        y: Math.max(MIN_Y, Math.min(y, height - panelHeight)),
      };
    },
    [getViewportDimensions]
  );

  /**
   * Handle mouse down on draggable element
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      dragOffsetRef.current = { x: position.x, y: position.y };
    },
    [position]
  );

  /**
   * Handle mouse move (drag)
   */
  useEffect(() => {
    if (!isDragging || !dragStartRef.current || !dragOffsetRef.current) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current || !dragOffsetRef.current) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      const newX = dragOffsetRef.current.x + deltaX;
      const newY = dragOffsetRef.current.y + deltaY;

      // Debounce position updates
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const clamped = clampPosition(newX, newY);
        setPosition(clamped);
      }, DRAG_DEBOUNCE_MS);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
      dragOffsetRef.current = null;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, clampPosition]);

  /**
   * Set position directly
   */
  const setPositionDirect = useCallback(
    (newPosition: Position) => {
      const clamped = clampPosition(newPosition.x, newPosition.y);
      setPosition(clamped);
    },
    [clampPosition]
  );

  /**
   * Reset position to default
   */
  const resetPosition = useCallback(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  return {
    position,
    setPosition: setPositionDirect,
    resetPosition,
    isDragging,
    handleMouseDown,
  };
}
