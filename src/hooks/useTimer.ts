import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  limitMinutes?: number;
  onTimeUp?: () => void;
}

export function useTimer({ limitMinutes, onTimeUp }: UseTimerOptions = {}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (limitMinutes && next >= limitMinutes * 60) {
          onTimeUpRef.current?.();
          setIsRunning(false);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, limitMinutes]);

  const remainingSeconds = limitMinutes
    ? Math.max(0, limitMinutes * 60 - elapsedSeconds)
    : undefined;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return {
    elapsedSeconds,
    remainingSeconds,
    isRunning,
    start,
    pause,
    formattedElapsed: formatTime(elapsedSeconds),
    formattedRemaining: remainingSeconds !== undefined ? formatTime(remainingSeconds) : undefined,
  };
}
