// TaskManager.tsx
import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  CheckIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  PlusIcon,
  ClockIcon,
  ArchiveBoxArrowDownIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { PlayCircleIcon } from '@heroicons/react/24/solid';
import { apiService } from './apiService';
import {
  TaskWithPomodoros,
  tasksAtom,
  tasksLoadingAtom,
  fetchTasksAtom,
  newTaskTitleAtom,
  newTaskEstimateAtom,
  editingTaskIdAtom,
  editTitleAtom,
  editEstimateAtom,
  deletingTaskIdAtom
} from './atoms';

interface TaskManagerProps {
  onSelectTask?: (taskId: string) => void;
  selectedTaskId?: string;
}

type FilterType = 'all' | 'active' | 'completed';

const TaskManager: React.FC<TaskManagerProps> = ({ onSelectTask, selectedTaskId }) => {
  const [tasks] = useAtom(tasksAtom);
  const [isLoading] = useAtom(tasksLoadingAtom);
  const [, fetchTasks] = useAtom(fetchTasksAtom);

  const [activeTab, setActiveTab] = useState<FilterType>('active');

  const [newTaskTitle, setNewTaskTitle] = useAtom(newTaskTitleAtom);
  const [newTaskEstimate, setNewTaskEstimate] = useAtom(newTaskEstimateAtom);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Editing state
  const [editingTaskId, setEditingTaskId] = useAtom(editingTaskIdAtom);
  const [editTitle, setEditTitle] = useAtom(editTitleAtom);
  const [editEstimate, setEditEstimate] = useAtom(editEstimateAtom);
  const [, setIsEditing] = useState(false);

  // Delete confirmation state
  const [deletingTaskId, setDeletingTaskId] = useAtom(deletingTaskIdAtom);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) return;

    try {
      setIsSubmitting(true);
      await apiService.createTask(
        'default_user',
        newTaskTitle.trim(),
        newTaskEstimate
      );

      toast.success('Task created successfully');
      await fetchTasks();

      setNewTaskTitle('');
      setNewTaskEstimate(1);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    if (onSelectTask) {
      onSelectTask(taskId);
      toast.info('Task selected for focus');
    }
  };

  const startEditing = (task: TaskWithPomodoros) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditEstimate(task.estimated_pomodoros);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditEstimate(1);
    setIsEditing(false);
  };

  const handleUpdateTask = async (taskId: string) => {
    if (!editTitle.trim()) return;

    try {
      setIsEditing(true);
      await apiService.updateTask(taskId, {
        title: editTitle.trim(),
        estimated_pomodoros: editEstimate
      });

      toast.success('Task updated');
      await fetchTasks();

      setEditingTaskId(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleToggleComplete = async (task: TaskWithPomodoros) => {
    try {
      const newStatus = !task.completed;
      await apiService.updateTask(task.id, {
        completed: newStatus
      });

      toast.success(newStatus ? 'Task completed!' : 'Task reopened');
      await fetchTasks();
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Failed to update task status');
    }
  };

  const confirmDelete = (taskId: string) => {
    setDeletingTaskId(taskId);
  };

  const cancelDelete = () => {
    setDeletingTaskId(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsDeleting(true);
      await apiService.deleteTask(taskId);

      toast.success('Task deleted');
      await fetchTasks();

      setDeletingTaskId(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return !task.completed;
    if (activeTab === 'completed') return task.completed;
    return true;
  });

  const tabItems: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Tasks' },
    { id: 'active', label: 'In Progress' },
    { id: 'completed', label: 'Completed' }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] rounded-3xl overflow-hidden">
      <main className="flex-1 px-4 sm:px-8 py-6">
        <div className="max-w-[800px] mx-auto">
          {/* Page Heading */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-wrap justify-between items-end gap-3 mb-8"
          >
            <div className="flex flex-col gap-1">
              <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Current Tasks</p>
              <p className="text-slate-500 dark:text-[#92a9c9] text-base font-normal leading-normal">Manage your focus sessions for today</p>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="pb-6">
            <div className="flex border-b border-slate-200 dark:border-[#324867] gap-8 overflow-x-auto no-scrollbar relative">
              {tabItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex flex-col items-center justify-center pb-[13px] pt-4 px-2 transition-colors ${activeTab === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-[#92a9c9] hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em] whitespace-nowrap z-10">{item.label}</p>
                  {activeTab === item.id && (
                    <motion.div
                      layoutId="taskTabActive"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-600 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Task List */}
          <div className="flex flex-col gap-3 min-h-[300px]">
            <AnimatePresence mode="popLayout" initial={false}>
              {isLoading && tasks.length === 0 ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center gap-4 text-slate-400"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="rounded-full h-8 w-8 border-b-2 border-indigo-600"
                  />
                  <p>Loading tasks...</p>
                </motion.div>
              ) : filteredTasks.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-12 flex flex-col items-center gap-4 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <ListBulletIcon className="h-12 w-12 opacity-20" />
                  <p>No tasks found in this view.</p>
                </motion.div>
              ) : (
                filteredTasks.map((task, index) => {
                  const progress = task.estimated_pomodoros > 0
                    ? Math.min(Math.round((task.actual_pomodoros / task.estimated_pomodoros) * 100), 100)
                    : 0;

                  return (
                    <motion.div
                      layout
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        mass: 1,
                        delay: index * 0.02
                      }}
                      className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-[#111822] border rounded-xl px-4 py-3 justify-between transition-all ${selectedTaskId === task.id
                        ? 'border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'border-slate-200 dark:border-[#233348] hover:border-indigo-400 dark:hover:border-indigo-600'
                        } ${task.completed ? 'opacity-75' : ''}`}
                    >
                      {editingTaskId === task.id ? (
                        <motion.div
                          layout
                          className="flex-1 w-full flex flex-col gap-3"
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            autoFocus
                          />
                          <div className="flex items-center gap-3 justify-between">
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                              <ClockIcon className="h-4 w-4 text-slate-400" />
                              <input
                                type="number"
                                min="1"
                                max="20"
                                value={editEstimate}
                                onChange={(e) => setEditEstimate(parseInt(e.target.value) || 1)}
                                className="w-10 bg-transparent text-sm font-bold outline-none"
                              />
                            </div>
                            <div className="flex gap-2">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleUpdateTask(task.id)}
                                className="p-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={cancelEditing}
                                className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-300"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ) : deletingTaskId === task.id ? (
                        <motion.div
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex-1 w-full flex justify-between items-center py-1"
                        >
                          <p className="text-sm font-semibold text-red-500">Delete this task?</p>
                          <div className="flex gap-2">
                            <button onClick={() => handleDeleteTask(task.id)} className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600">
                              Delete
                            </button>
                            <button onClick={cancelDelete} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-300">
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <>
                          <div className="flex items-start gap-4 w-full sm:w-auto overflow-hidden">
                            <div className="flex size-7 items-center justify-center flex-shrink-0 mt-0.5">
                              <input
                                checked={task.completed}
                                onChange={() => handleToggleComplete(task)}
                                className="h-5 w-5 rounded border-slate-300 dark:border-[#324867] border-2 bg-transparent text-indigo-600 checked:bg-indigo-600 checked:border-indigo-600 focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer transition-colors"
                                type="checkbox"
                              />
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                              <p className={`text-base font-semibold leading-normal truncate pr-2 transition-all ${task.completed ? 'text-slate-500 line-through dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                                {task.title}
                              </p>
                              <p className="text-slate-500 dark:text-[#92a9c9] text-sm font-normal leading-normal truncate">
                                {task.actual_pomodoros}/{task.estimated_pomodoros} pomos completed
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0 pl-11 sm:pl-0">
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-[#324867]">
                                <motion.div
                                  className={`h-full rounded-full ${task.completed ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 1 }}
                                />
                              </div>
                              <p className="text-slate-700 dark:text-white text-sm font-bold leading-normal w-9 text-right">{progress}%</p>
                            </div>

                            <div className="flex items-center gap-1">
                              {!task.completed && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleTaskSelect(task.id)}
                                  className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                                  title="Focus on this task"
                                >
                                  {selectedTaskId === task.id ? (
                                    <PlayCircleIcon className="h-4 w-4 text-indigo-600" />
                                  ) : (
                                    <PlayIcon className="h-4 w-4" />
                                  )}
                                </motion.button>
                              )}

                              {!task.completed && (
                                <div className="flex items-center md:opacity-0 group-hover:opacity-100 transition-opacity">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => startEditing(task)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => confirmDelete(task.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </motion.button>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Add New Section */}
          <motion.div
            layout
            className="mt-10 mb-10 p-8 border-2 border-dashed border-slate-200 dark:border-[#233348] rounded-2xl flex flex-col items-center justify-center text-center bg-white/50 dark:bg-white/5 backdrop-blur-sm"
          >
            <AnimatePresence mode="wait">
              {showAddForm ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="w-full max-w-md"
                >
                  <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Create New Task</h3>
                  <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Task name..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                      autoFocus
                    />
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-500">Estimate:</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={newTaskEstimate}
                          onChange={(e) => setNewTaskEstimate(parseInt(e.target.value) || 1)}
                          className="w-12 bg-transparent text-lg font-bold text-center outline-none"
                        />
                        <span className="text-sm font-medium text-slate-500">pomos</span>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-center mt-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isSubmitting || !newTaskTitle.trim()}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
                      >
                        Save Task
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center"
                >
                  <div className="size-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                    <ArchiveBoxArrowDownIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Ready for a new goal?</h3>
                  <p className="text-slate-500 dark:text-[#92a9c9] mb-6 max-w-xs mx-auto">Break down your big projects into small, manageable focus sessions.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddForm(true)}
                    className="flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-indigo-600 text-white text-base font-bold leading-normal tracking-[0.015em] transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    <span>Create New Task</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TaskManager;
