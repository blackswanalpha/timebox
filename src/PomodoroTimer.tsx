// PomodoroTimer.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { Play, Pause, Square, Target, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTimer } from './useTimer';
import { tasksAtom, fetchTasksAtom } from './atoms';

interface PomodoroTimerProps {
  selectedTaskId?: string;
  onTaskSelect?: (taskId: string) => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ selectedTaskId, onTaskSelect }) => {
  const {
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
  } = useTimer();

  const [tasks] = useAtom(tasksAtom);
  const [, fetchTasks] = useAtom(fetchTasksAtom);

  const [localSelectedTask, setLocalSelectedTask] = useState<string | undefined>(selectedTaskId);
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  // Sync with external selectedTaskId
  useEffect(() => {
    setLocalSelectedTask(selectedTaskId);
  }, [selectedTaskId]);

  // Load tasks if empty
  useEffect(() => {
    if (tasks.length === 0) {
      fetchTasks();
    }
  }, [tasks.length, fetchTasks]);

  // Handle timer completion
  useEffect(() => {
    if (isCompleted) {
      toast.success('Timer Completed! Take a break.', {
        duration: 5000,
        action: {
          label: 'Dismiss',
          onClick: () => dismissCompletion(),
        },
      });
      // Play a sound could be added here
    }
  }, [isCompleted, dismissCompletion]);

  // Calculate progress for the circular indicator
  const progress = useMemo(() => {
    const totalSeconds = (timerStatus.duration_minutes || 25) * 60;
    const currentSeconds = minutes * 60 + seconds;
    const elapsed = totalSeconds - currentSeconds;
    return (elapsed / totalSeconds) * 100;
  }, [minutes, seconds, timerStatus.duration_minutes]);

  const handleStart = () => {
    if (!localSelectedTask && tasks.length > 0 && !showTaskSelector) {
      // If no task selected but tasks exist, show selector
      setShowTaskSelector(true);
      toast.info('Please select a task to start or choose "No Task"');
      return;
    }

    startTimer(localSelectedTask, timerStatus.session_type || 'FOCUS');
    toast.success('Timer Started');
    setShowTaskSelector(false);
  };

  const handlePause = () => {
    pauseTimer();
    toast.info('Timer Paused');
  };

  const handleResume = () => {
    resumeTimer();
    toast.success('Timer Resumed');
  };

  const handleStop = () => {
    stopTimer();
    toast.info('Timer Stopped');
  };

  const handleTaskSelect = (taskId: string) => {
    setLocalSelectedTask(taskId);
    if (onTaskSelect) {
      onTaskSelect(taskId);
    }
    setShowTaskSelector(false);
    // Start the timer after selecting a task
    startTimer(taskId, timerStatus.session_type || 'FOCUS');
    toast.success('Task selected and timer started');
  };

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  const getSessionIcon = () => {
    switch (timerStatus.session_type) {
      case 'FOCUS':
        return <Target size={24} />;
      case 'SHORT_BREAK':
      case 'LONG_BREAK':
        return <CheckCircle2 size={24} />;
      default:
        return <Target size={24} />;
    }
  };

  const getSessionLabel = () => {
    switch (timerStatus.session_type) {
      case 'FOCUS':
        return 'Focus Time';
      case 'SHORT_BREAK':
        return 'Short Break';
      case 'LONG_BREAK':
        return 'Long Break';
      default:
        return 'Timer';
    }
  };

  const getStatusText = () => {
    if (!isActive && !isPaused) return 'Ready to start';
    if (isPaused) return 'Paused';
    return 'In progress';
  };

  return (
    <div className="card pomodoro-timer">
      <div className="timer-header">
        <div className="session-label">
          {getSessionIcon()}
          {getSessionLabel()}
        </div>

        {timerStatus.task_title && (
          <div className="current-task-display">
            <Target size={16} />
            <span>{timerStatus.task_title}</span>
          </div>
        )}
      </div>

      <div className="timer-circle-container">
        <svg className="timer-svg" viewBox="0 0 100 100">
          <circle
            className="timer-circle-bg"
            cx="50"
            cy="50"
            r="45"
          />
          <circle
            className="timer-circle-progress"
            cx="50"
            cy="50"
            r="45"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
          />
        </svg>
        <div className="timer-display">
          <span className="time">{formatTime(minutes)}:{formatTime(seconds)}</span>
        </div>
      </div>

      <div className="timer-controls">
        {!isActive && !isPaused ? (
          <button onClick={handleStart} className="btn btn-primary btn-lg">
            <Play size={20} />
            Start
          </button>
        ) : (
          <>
            {isPaused ? (
              <button onClick={handleResume} className="btn btn-success btn-lg">
                <Play size={20} />
                Resume
              </button>
            ) : (
              <button onClick={handlePause} className="btn btn-secondary btn-lg">
                <Pause size={20} />
                Pause
              </button>
            )}
            <button onClick={handleStop} className="btn btn-danger btn-lg">
              <Square size={20} />
              Stop
            </button>
            <button onClick={recordInterruption} className="btn btn-warning btn-lg">
              <AlertTriangle size={20} />
              Interruption
            </button>
          </>
        )}
      </div>

      {showTaskSelector && (
        <div className="task-selector-card">
          <div className="task-selector-header">
            <Target size={18} />
            <span>Select a Task</span>
          </div>
          <ul className="task-selector-list">
            {tasks.map(task => (
              <li
                key={task.id}
                className="task-selector-item"
                onClick={() => handleTaskSelect(task.id)}
              >
                <div>
                  <div className="task-title">{task.title}</div>
                  <div className="task-estimate">{task.estimated_pomodoros} pomodoros estimated</div>
                </div>
                <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
              </li>
            ))}
            <li
              className="task-selector-item"
              onClick={() => {
                setLocalSelectedTask(undefined);
                if (onTaskSelect) {
                  onTaskSelect('');
                }
                setShowTaskSelector(false);
                startTimer(undefined, timerStatus.session_type || 'FOCUS');
                toast.success('Started timer without task');
              }}
            >
              <div className="task-title">No Task</div>
              <div className="task-estimate">Continue without a task</div>
            </li>
          </ul>
        </div>
      )}

      <div className="session-status">
        <span className="status-dot"></span>
        <span>{getStatusText()} • {timerStatus.session_type}</span>
      </div>
    </div>
  );
};

export default PomodoroTimer;
