import { atom } from 'jotai';
import { Task, StopwatchSession } from './types';
import { apiService } from './apiService';

// UI State
export type TabType = 'timer' | 'tasks' | 'goals' | 'history' | 'analytics' | 'settings' | 'about' | 'manual-entry' | 'break' | 'stopwatch';
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
export const taskShowAddFormAtom = atom<boolean>(false);

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

// Sound Settings State
const getInitialSoundEnabled = (): boolean => {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('sound_enabled');
  return saved ? saved === 'true' : true;
};

const getInitialSoundVolume = (): number => {
  if (typeof window === 'undefined') return 70;
  const saved = localStorage.getItem('sound_volume');
  return saved ? parseInt(saved, 10) : 70;
};

const soundEnabledBaseAtom = atom<boolean>(getInitialSoundEnabled());
const soundVolumeBaseAtom = atom<number>(getInitialSoundVolume());

export const soundEnabledAtom = atom(
  (get) => get(soundEnabledBaseAtom),
  (_get, set, newValue: boolean) => {
    set(soundEnabledBaseAtom, newValue);
    localStorage.setItem('sound_enabled', newValue.toString());
    // Also update backend if needed, but for now we'll assume SettingsPanel handles it or we'll trigger a fetch
  }
);

export const soundVolumeAtom = atom(
  (get) => get(soundVolumeBaseAtom),
  (_get, set, newValue: number) => {
    const clamped = Math.max(0, Math.min(100, newValue));
    set(soundVolumeBaseAtom, clamped);
    localStorage.setItem('sound_volume', clamped.toString());
  }
);

export const fetchSettingsAtom = atom(
  null,
  async (_get, set) => {
    try {
      const settings = await apiService.getSettings('default_user');
      set(soundEnabledBaseAtom, settings.sound_enabled);
      set(soundVolumeBaseAtom, settings.sound_volume);
      localStorage.setItem('sound_enabled', settings.sound_enabled.toString());
      localStorage.setItem('sound_volume', settings.sound_volume.toString());
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }
);

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

// Stopwatch State Helpers
const getInitialStopwatchElapsed = (): number => {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem('stopwatch_elapsed');
  return saved ? parseInt(saved, 10) : 0;
};

const getInitialStopwatchRunning = (): boolean => {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem('stopwatch_is_running');
  return saved ? saved === 'true' : false;
};

const getInitialStopwatchLastTick = (): number => {
  if (typeof window === 'undefined') return Date.now();
  const saved = localStorage.getItem('stopwatch_last_tick');
  return saved ? parseInt(saved, 10) : Date.now();
};

const getInitialStopwatchHistory = (): StopwatchSession[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('stopwatch_history');
  return saved ? JSON.parse(saved) : [];
};

const stopwatchElapsedBaseAtom = atom<number>(getInitialStopwatchElapsed());
const stopwatchIsRunningBaseAtom = atom<boolean>(getInitialStopwatchRunning());
const stopwatchLastTickBaseAtom = atom<number>(getInitialStopwatchLastTick());
const stopwatchHistoryBaseAtom = atom<StopwatchSession[]>(getInitialStopwatchHistory());

// Stopwatch Atoms
export const stopwatchElapsedAtom = atom(
  (get) => get(stopwatchElapsedBaseAtom),
  (_get, set, newValue: number) => {
    set(stopwatchElapsedBaseAtom, newValue);
    localStorage.setItem('stopwatch_elapsed', newValue.toString());
  }
);

export const stopwatchIsRunningAtom = atom(
  (get) => get(stopwatchIsRunningBaseAtom),
  (_get, set, newValue: boolean) => {
    set(stopwatchIsRunningBaseAtom, newValue);
    localStorage.setItem('stopwatch_is_running', newValue.toString());
  }
);

export const stopwatchLastTickAtom = atom(
  (get) => get(stopwatchLastTickBaseAtom),
  (_get, set, newValue: number) => {
    set(stopwatchLastTickBaseAtom, newValue);
    localStorage.setItem('stopwatch_last_tick', newValue.toString());
  }
);

export const stopwatchHistoryAtom = atom(
  (get) => get(stopwatchHistoryBaseAtom),
  (get, set, newValue: StopwatchSession[] | ((prev: StopwatchSession[]) => StopwatchSession[])) => {
    const resolved = typeof newValue === 'function' ? newValue(get(stopwatchHistoryBaseAtom)) : newValue;
    set(stopwatchHistoryBaseAtom, resolved);
    localStorage.setItem('stopwatch_history', JSON.stringify(resolved));
  }
);

export const stopwatchLabelAtom = atom<string>('');

// Daily Reflection State
import { DailyReflection, DayActivities, TimelineActivity } from './types';

export const clockoutModalOpenAtom = atom<boolean>(false);
export const selectedReflectionDateAtom = atom<Date>(new Date());
export const calendarViewMonthAtom = atom<Date>(new Date());
export const currentReflectionAtom = atom<DailyReflection | null>(null);
export const dayActivitiesAtom = atom<DayActivities>({ pomodoro_sessions: [], completed_tasks: [] });
export const timelineActivitiesAtom = atom<TimelineActivity[]>([]);
export const monthReflectionsAtom = atom<DailyReflection[]>([]);

// Reflection Form State
export const reflectionTitleAtom = atom<string>('');
export const reflectionDurationAtom = atom<string>('');
export const reflectionPurposeAtom = atom<string>('');
export const reflectionNotesAtom = atom<string>('');
export const reflectionMoodAtom = atom<number | undefined>(undefined);
export const reflectionProductivityAtom = atom<number | undefined>(undefined);

// Actions
export const fetchDayActivitiesAtom = atom(
  null,
  async (get, set) => {
    const date = get(selectedReflectionDateAtom);
    try {
      const activities = await apiService.getDayActivities('default_user', date);
      set(dayActivitiesAtom, activities);
      
      // Convert to timeline activities
      const timeline: TimelineActivity[] = [
        ...activities.pomodoro_sessions.map(session => ({
          id: session.id,
          type: 'pomodoro' as const,
          title: session.task_title || 'Focus Session',
          duration: session.duration_seconds,
          startTime: session.start_time,
          endTime: session.end_time,
          interrupted: session.interrupted
        })),
        ...activities.completed_tasks.map(task => ({
          id: task.id,
          type: 'task' as const,
          title: task.title,
          startTime: task.created_at,
          completed: task.completed
        }))
      ].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      
      set(timelineActivitiesAtom, timeline);
    } catch (error) {
      console.error('Error fetching day activities:', error);
    }
  }
);

export const fetchReflectionAtom = atom(
  null,
  async (get, set) => {
    const date = get(selectedReflectionDateAtom);
    try {
      const reflection = await apiService.getDailyReflection('default_user', date);
      set(currentReflectionAtom, reflection);
      
      if (reflection) {
        set(reflectionTitleAtom, reflection.title || '');
        set(reflectionDurationAtom, reflection.duration_reflection || '');
        set(reflectionPurposeAtom, reflection.purpose_reflection || '');
        set(reflectionNotesAtom, reflection.general_notes || '');
        set(reflectionMoodAtom, reflection.mood_rating ?? undefined);
        set(reflectionProductivityAtom, reflection.productivity_rating ?? undefined);
      } else {
        set(reflectionTitleAtom, '');
        set(reflectionDurationAtom, '');
        set(reflectionPurposeAtom, '');
        set(reflectionNotesAtom, '');
        set(reflectionMoodAtom, undefined);
        set(reflectionProductivityAtom, undefined);
      }
    } catch (error) {
      console.error('Error fetching reflection:', error);
    }
  }
);

export const fetchMonthReflectionsAtom = atom(
  null,
  async (get, set) => {
    const date = get(calendarViewMonthAtom);
    try {
      const reflections = await apiService.getReflectionsByMonth(
        'default_user',
        date.getFullYear(),
        date.getMonth() + 1
      );
      set(monthReflectionsAtom, reflections);
    } catch (error) {
      console.error('Error fetching month reflections:', error);
    }
  }
);

export const saveReflectionAtom = atom(
  null,
  async (get, set) => {
    const date = get(selectedReflectionDateAtom);
    const title = get(reflectionTitleAtom);
    const durationReflection = get(reflectionDurationAtom);
    const purposeReflection = get(reflectionPurposeAtom);
    const generalNotes = get(reflectionNotesAtom);
    const moodRating = get(reflectionMoodAtom);
    const productivityRating = get(reflectionProductivityAtom);
    
    try {
      await apiService.saveDailyReflection(
        'default_user',
        date,
        title.trim() || undefined,
        durationReflection.trim() || undefined,
        purposeReflection.trim() || undefined,
        generalNotes.trim() || undefined,
        moodRating,
        productivityRating
      );
      
      // Refresh the reflection
      await set(fetchReflectionAtom);
      await set(fetchMonthReflectionsAtom);
    } catch (error) {
      console.error('Error saving reflection:', error);
      throw error;
    }
  }
);
