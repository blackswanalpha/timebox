import { atom } from 'jotai';
import { Task } from './types';
import { apiService } from './apiService';

// UI State
export type TabType = 'timer' | 'tasks' | 'history' | 'analytics' | 'settings';
export const activeTabAtom = atom<TabType>('timer');

export const selectedTaskIdAtom = atom<string | undefined>(undefined);

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
