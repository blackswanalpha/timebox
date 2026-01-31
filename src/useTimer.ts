// useTimer.ts
import { useState, useEffect, useCallback } from 'react';
import { apiService } from './apiService';
import { TimerStatus } from './types';

export const useTimer = () => {
  const [timerStatus, setTimerStatus] = useState<TimerStatus>({
    time_remaining: 0,
    is_running: false,
    is_paused: false,
    session_type: 'FOCUS',
    task_title: undefined,
    duration_minutes: 25,
    interruption_count: 0
  });
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

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
  }, [timerStatus, isCompleted]);

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
  }, [timerStatus.is_running]);

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
  }, []);

  const pauseTimer = useCallback(async () => {
    try {
      await apiService.pauseSession();
      // Immediately fetch status to update UI
      const status = await apiService.getTimerStatus();
      setTimerStatus(status);
    } catch (error) {
      console.error('Error pausing timer:', error);
    }
  }, []);

  const resumeTimer = useCallback(async () => {
    try {
      await apiService.resumeSession();
      // Immediately fetch status to update UI
      const status = await apiService.getTimerStatus();
      setTimerStatus(status);
    } catch (error) {
      console.error('Error resuming timer:', error);
    }
  }, []);

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
  }, []);

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
  }, []);

  const dismissCompletion = useCallback(() => {
    setIsCompleted(false);
  }, []);

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
