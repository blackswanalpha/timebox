import { atom } from 'jotai';
import { Task } from './types';
import { apiService } from './apiService';

// UI State
export type TabType = 'timer' | 'tasks' | 'goals' | 'history' | 'analytics' | 'settings' | 'manual-entry';
export const activeTabAtom = atom<TabType>('timer');

export const selectedTaskIdAtom = atom<string | undefined>(undefined);

// Persistent UI State - TaskManager
export type TaskTabType = 'todo' | 'done';
export const taskActiveTabAtom = atom<TaskTabType>('todo');
export const newTaskTitleAtom = atom<string>('');
export const newTaskEstimateAtom = atom<number>(1);
export const editingTaskIdAtom = atom<string | null>(null);
export const editTitleAtom = atom<string>('');
export const editEstimateAtom = atom<number>(1);
export const deletingTaskIdAtom = atom<string | null>(null);

// Persistent UI State - PomodoroTimer
export const timerShowTaskSelectorAtom = atom<boolean>(false);

// Persistent UI State - GoalsManager
// goalTitleAtom and goalTargetAtom moved to Goal Form State section below

// Global Timer State
import { TimerStatus } from './types';
export const timerStatusAtom = atom<TimerStatus>({
  time_remaining: 0,
  is_running: false,
  is_paused: false,
  session_type: 'FOCUS',
  task_title: undefined,
  duration_minutes: 25,
  interruption_count: 0
});
export const timerMinutesAtom = atom(0);
export const timerSecondsAtom = atom(0);
export const timerIsActiveAtom = atom(false);
export const timerIsPausedAtom = atom(false);
export const timerIsCompletedAtom = atom(false);

// Theme State
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
  if (savedTheme) return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const themeBaseAtom = atom<'light' | 'dark'>(getInitialTheme());

export const themeAtom = atom(
  (get) => get(themeBaseAtom),
  (_get, set, newTheme: 'light' | 'dark') => {
    set(themeBaseAtom, newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
);

// Data State
export type TaskWithPomodoros = Task & { actual_pomodoros: number };
export const tasksAtom = atom<TaskWithPomodoros[]>([]);
export const tasksLoadingAtom = atom<boolean>(false);

// Action to refresh tasks
export const fetchTasksAtom = atom(
  null,
  async (_get, set) => {
    set(tasksLoadingAtom, true);
    try {
      // Assuming 'default_user' is what we are using for now as per previous code
      const tasks = await apiService.getTasksWithPomodoroCounts('default_user');
      set(tasksAtom, tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      set(tasksLoadingAtom, false);
    }
  }
);

// Goals State
import { Goal } from './types';
export type GoalViewMode = 'list' | 'create' | 'details' | 'edit';
export const activeGoalViewAtom = atom<GoalViewMode>('list');
export const selectedGoalIdAtom = atom<string | null>(null);

export const goalsAtom = atom<Goal[]>([]);
export const goalsLoadingAtom = atom<boolean>(false);

// Goal Form State
export const goalTitleAtom = atom<string>('');
export const goalTargetAtom = atom<number>(10);
export const goalCategoryAtom = atom<string>('Personal');
export const goalMotivationAtom = atom<string>('');
export const goalTargetDateAtom = atom<string>(''); // ISO date string YYYY-MM-DD
export const goalDescriptionAtom = atom<string>('');

// Action to refresh goals
export const fetchGoalsAtom = atom(
  null,
  async (_get, set) => {
    set(goalsLoadingAtom, true);
    try {
      const goals = await apiService.getGoals('default_user');
      set(goalsAtom, goals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      set(goalsLoadingAtom, false);
    }
  }
);

// Daily Stats State
export interface DailyStats {
  completed_pomodoros: number;
  daily_goal: number;
  total_focus_minutes: number;
  focus_score: number;
}

export const dailyStatsAtom = atom<DailyStats>({
  completed_pomodoros: 0,
  daily_goal: 8,
  total_focus_minutes: 0,
  focus_score: 0
});
