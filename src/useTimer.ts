// useTimer.ts
import { useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { apiService } from './apiService';
import {
  timerStatusAtom,
  timerMinutesAtom,
  timerSecondsAtom,
  timerIsActiveAtom,
  timerIsPausedAtom,
  timerIsCompletedAtom
} from './atoms';

export const useTimer = () => {
  const [timerStatus, setTimerStatus] = useAtom(timerStatusAtom);
  const [minutes, setMinutes] = useAtom(timerMinutesAtom);
  const [seconds, setSeconds] = useAtom(timerSecondsAtom);
  const [isActive, setIsActive] = useAtom(timerIsActiveAtom);
  const [isPaused, setIsPaused] = useAtom(timerIsPausedAtom);
  const [isCompleted, setIsCompleted] = useAtom(timerIsCompletedAtom);

  // Update the timer display based on the remaining time
  useEffect(() => {
    setMinutes(Math.floor(timerStatus.time_remaining / 60));
    setSeconds(timerStatus.time_remaining % 60);
    setIsActive(timerStatus.is_running && !timerStatus.is_paused);
    setIsPaused(timerStatus.is_paused);

    // Check if timer completed
    if (timerStatus.is_running && timerStatus.time_remaining === 0 && !isCompleted) {
      setIsCompleted(true);
    } else if (!timerStatus.is_running && timerStatus.time_remaining > 0) {
      setIsCompleted(false);
    }
  }, [timerStatus, isCompleted, setMinutes, setSeconds, setIsActive, setIsPaused, setIsCompleted]);

  // Poll for timer status updates
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const pollTimerStatus = async () => {
      try {
        const status = await apiService.getTimerStatus();
        setTimerStatus(status);
      } catch (error) {
        console.error('Error getting timer status:', error);
      }
    };

    // Poll every second when timer is active
    if (timerStatus.is_running) {
      interval = setInterval(pollTimerStatus, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStatus.is_running, setTimerStatus]);

  const startTimer = useCallback(async (taskId?: string, sessionType: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK' = 'FOCUS') => {
    try {
      await apiService.startSession('default_user', taskId, sessionType);
      setIsCompleted(false);
      // Immediately fetch status to start polling and update UI
      const status = await apiService.getTimerStatus();
      setTimerStatus(status);
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  }, [setIsCompleted, setTimerStatus]);

  const pauseTimer = useCallback(async () => {
    try {
      await apiService.pauseSession();
      // Immediately fetch status to update UI
      const status = await apiService.getTimerStatus();
      setTimerStatus(status);
    } catch (error) {
      console.error('Error pausing timer:', error);
    }
  }, [setTimerStatus]);

  const resumeTimer = useCallback(async () => {
    try {
      await apiService.resumeSession();
      // Immediately fetch status to update UI
      const status = await apiService.getTimerStatus();
      setTimerStatus(status);
    } catch (error) {
      console.error('Error resuming timer:', error);
    }
  }, [setTimerStatus]);

  const stopTimer = useCallback(async () => {
    try {
      await apiService.stopSession();
      setIsCompleted(false);
      // Immediately fetch status to update UI
      const status = await apiService.getTimerStatus();
      setTimerStatus(status);
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  }, [setIsCompleted, setTimerStatus]);

  const recordInterruption = useCallback(async () => {
    try {
      const count = await apiService.recordInterruption();
      // Update local state to reflect the new interruption count
      setTimerStatus(prev => ({
        ...prev,
        interruption_count: count
      }));
      return count;
    } catch (error) {
      console.error('Error recording interruption:', error);
      return null;
    }
  }, [setTimerStatus]);

  const dismissCompletion = useCallback(() => {
    setIsCompleted(false);
  }, [setIsCompleted]);

  return {
    minutes,
    seconds,
    isActive,
    isPaused,
    isCompleted,
    timerStatus,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    recordInterruption,
    dismissCompletion
  };
};
