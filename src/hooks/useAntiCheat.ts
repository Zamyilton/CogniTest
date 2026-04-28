import { useEffect, useRef, useCallback } from 'react';

interface AntiCheatState {
  tabSwitches: number;
  isPaused: boolean;
}

export function useAntiCheat(
  isActive: boolean,
  onTabSwitch: () => void,
  onResume: () => void,
  maxSwitches: number = 3
) {
  const stateRef = useRef<AntiCheatState>({ tabSwitches: 0, isPaused: false });
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  const handleVisibilityChange = useCallback(() => {
    if (!isActiveRef.current) return;

    if (document.hidden) {
      stateRef.current.tabSwitches += 1;
      stateRef.current.isPaused = true;
      onTabSwitch();
    } else {
      // Don't auto-resume, let the user click resume
    }
  }, [onTabSwitch]);

  const handleBlur = useCallback(() => {
    if (!isActiveRef.current) return;
    stateRef.current.tabSwitches += 1;
    stateRef.current.isPaused = true;
    onTabSwitch();
  }, [onTabSwitch]);

  const resume = useCallback(() => {
    stateRef.current.isPaused = false;
    onResume();
  }, [onResume]);

  const getSwitchCount = useCallback(() => {
    return stateRef.current.tabSwitches;
  }, []);

  useEffect(() => {
    if (!isActive) return;

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isActive, handleVisibilityChange, handleBlur]);

  return {
    resume,
    getSwitchCount,
    maxSwitches,
  };
}
