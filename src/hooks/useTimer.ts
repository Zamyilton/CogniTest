import { useState, useRef, useCallback, useEffect } from 'react';

export function useTimer(isPaused: boolean, onTimeUp?: () => void, timeLimit?: number) {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);
  const totalPausedRef = useRef<number>(0);
  const isPausedRef = useRef(isPaused);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  isPausedRef.current = isPaused;

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    startTimeRef.current = Date.now();
    totalPausedRef.current = 0;
    pausedTimeRef.current = 0;

    intervalRef.current = setInterval(() => {
      if (isPausedRef.current) {
        if (pausedTimeRef.current === 0) {
          pausedTimeRef.current = Date.now();
        }
        return;
      }

      if (pausedTimeRef.current > 0) {
        totalPausedRef.current += Date.now() - pausedTimeRef.current;
        pausedTimeRef.current = 0;
      }

      const now = Date.now();
      const elapsedMs = now - startTimeRef.current - totalPausedRef.current;
      const elapsedSec = Math.floor(elapsedMs / 1000);

      setElapsed(elapsedSec);

      if (timeLimit && elapsedSec >= timeLimit && onTimeUp) {
        onTimeUp();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeLimit, onTimeUp]);

  useEffect(() => {
    if (!isPaused && pausedTimeRef.current > 0) {
      totalPausedRef.current += Date.now() - pausedTimeRef.current;
      pausedTimeRef.current = 0;
    }
  }, [isPaused]);

  return {
    elapsed,
    formatted: formatTime(elapsed),
    formatTime,
  };
}
