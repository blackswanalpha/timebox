import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { TaskWithPomodoros } from './atoms';

interface CustomTaskSelectorProps {
    tasks: TaskWithPomodoros[];
    selectedTaskId?: string;
    onTaskSelect: (taskId: string) => void;
}

const CustomTaskSelector: React.FC<CustomTaskSelectorProps> = ({ tasks, selectedTaskId, onTaskSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedTask = tasks.find(t => t.id === selectedTaskId);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (taskId: string) => {
        onTaskSelect(taskId);
        setIsOpen(false);
    };

    const activeTasks = tasks.filter(t => !t.completed);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1">
                Currently Focusing On
            </label>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-14 px-5 bg-white dark:bg-slate-800 border rounded-2xl flex items-center justify-between transition-all duration-200 shadow-sm ${isOpen ? 'ring-4 ring-indigo-500/10 border-indigo-500' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-lg ${selectedTask ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-900/40 text-slate-400'}`}>
                        <ClockIcon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {selectedTask ? selectedTask.title : 'Default Focus Session'}
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className="text-slate-400"
                >
                    <ChevronDownIcon className="h-5 w-5" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="max-h-64 overflow-y-auto custom-scrollbar py-2">
                            <button
                                onClick={() => handleSelect('')}
                                className={`w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${!selectedTaskId ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
                            >
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Default Focus Session</span>
                                {!selectedTaskId && <CheckCircleIcon className="h-5 w-5 text-indigo-500" />}
                            </button>

                            <div className="px-5 py-2">
                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
                            </div>

                            {activeTasks.length > 0 ? (
                                activeTasks.map((task) => {
                                    const progress = task.estimated_pomodoros > 0
                                        ? Math.min(Math.round((task.actual_pomodoros / task.estimated_pomodoros) * 100), 100)
                                        : 0;

                                    return (
                                        <button
                                            key={task.id}
                                            onClick={() => handleSelect(task.id)}
                                            className={`w-full px-5 py-3 flex flex-col gap-1 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${selectedTaskId === task.id ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate pr-2">{task.title}</span>
                                                {selectedTaskId === task.id && <CheckCircleIcon className="h-5 w-5 text-indigo-500 flex-shrink-0" />}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        className="h-full bg-indigo-500"
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 w-7">{progress}%</span>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-5 py-6 text-center">
                                    <p className="text-xs text-slate-400 font-medium italic">No active tasks for today</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomTaskSelector;
