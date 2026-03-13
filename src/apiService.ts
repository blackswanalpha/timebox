// apiService.ts
import { invoke } from '@tauri-apps/api/core';
import {
  PomodoroSettings,
  Task,
  PomodoroSession,
  Goal,
  TimerStatus,
  SettingsUpdateRequest,
  DailyReflection,
  DayActivities
} from './types';

export const apiService = {
  // Timer functions
  async initializeApp(): Promise<void> {
    return await invoke('initialize_app');
  },

  async startSession(
    userId?: string,
    taskId?: string,
    sessionType: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK' = 'FOCUS'
  ): Promise<PomodoroSession> {
    return await invoke('start_session', {
      req: {
        user_id: userId || 'default_user',
        task_id: taskId,
        session_type: sessionType
      }
    });
  },

  async pauseSession(): Promise<void> {
    return await invoke('pause_session');
  },

  async resumeSession(): Promise<void> {
    return await invoke('resume_session');
  },

  async stopSession(): Promise<void> {
    return await invoke('stop_session');
  },

  async getTimerStatus(): Promise<TimerStatus> {
    return await invoke('get_timer_status');
  },

  async recordInterruption(): Promise<number> {
    return await invoke('record_interruption');
  },

  // Settings functions
  async getSettings(userId: string): Promise<PomodoroSettings> {
    return await invoke('get_settings', { userId: userId });
  },

  async updateSettings(request: SettingsUpdateRequest): Promise<void> {
    return await invoke('update_settings', { req: request });
  },

  // Task functions
  async createTask(
    userId: string,
    title: string,
    estimatedPomodoros?: number
  ): Promise<Task> {
    return await invoke('create_task', {
      userId: userId,
      title,
      estimatedPomodoros: estimatedPomodoros
    });
  },

  async getTasks(userId: string): Promise<Task[]> {
    return await invoke('get_tasks', { userId: userId });
  },

  async updateTask(
    taskId: string,
    updates: { title?: string; estimated_pomodoros?: number; completed?: boolean }
  ): Promise<Task> {
    return await invoke('update_task', {
      req: {
        task_id: taskId,
        title: updates.title,
        estimated_pomodoros: updates.estimated_pomodoros,
        completed: updates.completed
      }
    });
  },

  async deleteTask(taskId: string): Promise<void> {
    return await invoke('delete_task', { taskId: taskId });
  },

  async getTasksWithPomodoroCounts(userId: string): Promise<Array<Task & { actual_pomodoros: number }>> {
    return await invoke('get_tasks_with_pomodoro_counts', { userId: userId });
  },

  // Session functions
  async getSessions(userId: string): Promise<PomodoroSession[]> {
    return await invoke('get_sessions', { userId: userId });
  },

  async getTodaySessions(userId: string): Promise<PomodoroSession[]> {
    return await invoke('get_today_sessions', { userId: userId });
  },

  // Goal functions
  async createGoal(
    userId: string,
    title: string,
    targetPomodoros: number,
    category?: string,
    motivation?: string,
    targetDate?: string, // ISO string
    description?: string
  ): Promise<Goal> {
    return await invoke('create_goal', {
      userId: userId,
      title,
      targetPomodoros: targetPomodoros,
      category,
      motivation,
      targetDate,
      description
    });
  },

  async getGoals(userId: string): Promise<Goal[]> {
    return await invoke('get_goals', { userId: userId });
  },

  async updateGoal(
    goalId: string,
    updates: {
      title?: string;
      target_pomodoros?: number;
      completed?: boolean;
      category?: string;
      motivation?: string;
      target_date?: string;
      description?: string;
    }
  ): Promise<void> {
    return await invoke('update_goal', {
      req: {
        goal_id: goalId,
        ...updates
      }
    });
  },

  async deleteGoal(goalId: string): Promise<void> {
    return await invoke('delete_goal', { goalId: goalId });
  },

  // Manual session logging
  async logManualSession(
    userId: string,
    taskId: string | undefined,
    startTime: Date,
    endTime: Date,
    durationSeconds: number
  ): Promise<PomodoroSession> {
    return await invoke('log_manual_session', {
      req: {
        user_id: userId,
        task_id: taskId || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_seconds: durationSeconds
      }
    });
  },

  // Date range sessions for heatmap
  async getSessionsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    sessionType?: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'
  ): Promise<PomodoroSession[]> {
    return await invoke('get_sessions_by_date_range', {
      req: {
        user_id: userId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        session_type: sessionType
      }
    });
  },

  // Daily Reflection functions
  async saveDailyReflection(
    userId: string,
    reflectionDate: Date,
    title?: string,
    durationReflection?: string,
    purposeReflection?: string,
    generalNotes?: string,
    moodRating?: number,
    productivityRating?: number
  ): Promise<DailyReflection> {
    return await invoke('save_daily_reflection', {
      req: {
        user_id: userId,
        reflection_date: reflectionDate.toISOString(),
        title,
        duration_reflection: durationReflection,
        purpose_reflection: purposeReflection,
        general_notes: generalNotes,
        mood_rating: moodRating,
        productivity_rating: productivityRating
      }
    });
  },

  async getDailyReflection(
    userId: string,
    reflectionDate: Date
  ): Promise<DailyReflection | null> {
    return await invoke('get_daily_reflection', {
      req: {
        user_id: userId,
        reflection_date: reflectionDate.toISOString()
      }
    });
  },

  async getReflectionsByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<DailyReflection[]> {
    return await invoke('get_reflections_by_month', {
      req: {
        user_id: userId,
        year,
        month
      }
    });
  },

  async getDayActivities(
    userId: string,
    date: Date
  ): Promise<DayActivities> {
    return await invoke('get_day_activities', {
      req: {
        user_id: userId,
        date: date.toISOString()
      }
    });
  }
};