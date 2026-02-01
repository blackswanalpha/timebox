// types.ts
export interface User {
  id: string;
  name: string;
  timezone: string;
  created_at: string;
}

export interface PomodoroSettings {
  user_id: string;
  focus_minutes: number;
  short_break_minutes: number;
  long_break_minutes: number;
  cycles_before_long_break: number;
  strict_mode: boolean;
  auto_start_breaks: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  estimated_pomodoros: number;
  completed: boolean;
  created_at: string;
}

export interface PomodoroSession {
  id: string;
  user_id: string;
  task_id?: string;
  session_type: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  interrupted: boolean;
  interruption_count: number;
  manual_override: boolean;
  created_at: string;
  task_title?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_pomodoros: number;
  completed_pomodoros: number;
  completed: boolean;
  category?: string;
  motivation?: string;
  target_date?: string; // ISO String
  description?: string;
  created_at: string;
}

export interface TimerStatus {
  time_remaining: number; // seconds
  is_running: boolean;
  is_paused: boolean;
  session_type: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
  task_title?: string;
  duration_minutes: number;
  interruption_count: number;
}

export interface SettingsUpdateRequest {
  user_id: string;
  focus_minutes?: number;
  short_break_minutes?: number;
  long_break_minutes?: number;
  cycles_before_long_break?: number;
  strict_mode?: boolean;
  auto_start_breaks?: boolean;
}