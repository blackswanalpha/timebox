import { useEffect, useRef, useCallback } from 'react';
import { useAtom } from 'jotai';
import {
  stopwatchElapsedAtom,
  stopwatchIsRunningAtom,
  stopwatchLastTickAtom,
  stopwatchHistoryAtom,
  stopwatchLabelAtom
} from './atoms';
import { StopwatchSession } from './types';

// Simple ID generator
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useStopwatch = () => {
  const [elapsedSeconds, setElapsedSeconds] = useAtom(stopwatchElapsedAtom);
  const [isRunning, setIsRunning] = useAtom(stopwatchIsRunningAtom);
  const [lastTick, setLastTick] = useAtom(stopwatchLastTickAtom);
  const [history, setHistory] = useAtom(stopwatchHistoryAtom);
  const [label, setLabel] = useAtom(stopwatchLabelAtom);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(elapsedSeconds);

  // Keep ref in sync
  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // Calculate and account for time elapsed while app was closed
  useEffect(() => {
    if (isRunning && typeof window !== 'undefined') {
      const now = Date.now();
      const timeSinceLastTick = Math.floor((now - lastTick) / 1000);

      // If significant time passed (more than 2 seconds), add it to elapsed
      if (timeSinceLastTick > 2) {
        const newElapsed = elapsedSeconds + timeSinceLastTick;
        setElapsedSeconds(newElapsed);
      }

      // Update last tick to now
      setLastTick(now);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manage the interval for counting
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const newElapsed = elapsedRef.current + 1;
        elapsedRef.current = newElapsed;
        setElapsedSeconds(newElapsed);
        setLastTick(Date.now());
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, setElapsedSeconds, setLastTick]);

  const startStopwatch = useCallback(() => {
    setIsRunning(true);
    setLastTick(Date.now());
  }, [setIsRunning, setLastTick]);

  const pauseStopwatch = useCallback(() => {
    setIsRunning(false);
  }, [setIsRunning]);

  const resumeStopwatch = useCallback(() => {
    setIsRunning(true);
    setLastTick(Date.now());
  }, [setIsRunning, setLastTick]);

  const resetStopwatch = useCallback(() => {
    setIsRunning(false);
    elapsedRef.current = 0;
    setElapsedSeconds(0);
    setLastTick(Date.now());
  }, [setIsRunning, setElapsedSeconds, setLastTick]);

  const stopAndSaveStopwatch = useCallback((sessionLabel?: string) => {
    const finalDuration = elapsedRef.current;

    if (finalDuration > 0) {
      const newSession: StopwatchSession = {
        id: generateId(),
        duration_seconds: finalDuration,
        label: sessionLabel || label || undefined,
        created_at: new Date().toISOString()
      };

      setHistory([newSession, ...history]);
    }

    // Reset after saving
    setIsRunning(false);
    elapsedRef.current = 0;
    setElapsedSeconds(0);
    setLabel('');
    setLastTick(Date.now());
  }, [label, history, setHistory, setIsRunning, setElapsedSeconds, setLabel, setLastTick]);

  const deleteHistoryEntry = useCallback((sessionId: string) => {
    setHistory(history.filter(session => session.id !== sessionId));
  }, [history, setHistory]);

  const clearAllHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  // Format helpers
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours,
      minutes,
      seconds,
      formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    };
  };

  const currentTime = formatTime(elapsedSeconds);

  return {
    // State
    elapsedSeconds,
    isRunning,
    history,
    label,

    // Time display
    hours: currentTime.hours,
    minutes: currentTime.minutes,
    seconds: currentTime.seconds,
    formattedTime: currentTime.formatted,

    // Actions
    startStopwatch,
    pauseStopwatch,
    resumeStopwatch,
    resetStopwatch,
    stopAndSaveStopwatch,
    deleteHistoryEntry,
    clearAllHistory,
    setLabel
  };
};
