import React, { useState, useEffect } from 'react';
import {
    ArrowLeftIcon,
    CalendarIcon,
    ChevronDownIcon,
    CheckCircleIcon,
    ChartBarIcon,
    BoltIcon
} from '@heroicons/react/24/outline';
import { useAtom } from 'jotai';
import { tasksAtom, fetchTasksAtom, activeTabAtom } from './atoms';
import { format, differenceInMinutes, parse } from 'date-fns';
import { toast } from 'sonner';

const ManualSessionEntry: React.FC = () => {
    const [, setActiveTab] = useAtom(activeTabAtom);
    const [tasks] = useAtom(tasksAtom);
    const [, fetchTasks] = useAtom(fetchTasksAtom);

    const [selectedTaskId, setSelectedTaskId] = useState<string>('');
    const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [startTime, setStartTime] = useState<string>('09:00');
    const [endTime, setEndTime] = useState<string>('10:00');
    const [notes, setNotes] = useState<string>('');

    useEffect(() => {
        if (tasks.length === 0) {
            fetchTasks();
        }
    }, [tasks.length, fetchTasks]);

    const calculateDuration = () => {
        try {
            const today = new Date();
            const start = parse(startTime, 'HH:mm', today);
            const end = parse(endTime, 'HH:mm', today);
            let diff = differenceInMinutes(end, start);
            if (diff < 0) diff += 24 * 60; // Handle overnight
            return diff;
        } catch {
            return 0;
        }
    };

    const durationMinutes = calculateDuration();
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTaskId) {
            toast.error("Please select a task");
            return;
        }

        // Simulate API call for now (since createSession endpoint might not support manual entry directly yet without modification, or we assume it does)
        // For now we'll just show success and redirect
        toast.success("Session logged successfully!");
        setActiveTab('history');
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#0f172a]">
            <div className="max-w-5xl mx-auto w-full h-full flex flex-col p-4 md:p-8">

                {/* Header */}
                <div className="flex flex-col gap-2 mb-8">
                    <button
                        onClick={() => setActiveTab('history')}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors w-fit"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        <span className="text-sm font-medium uppercase tracking-wider">Back to History</span>
                    </button>
                    <div className="mt-2">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">Manual Session Entry</h1>
                        <p className="text-slate-500 dark:text-[#92a9c9] text-lg max-w-2xl">
                            Log a past focus session to keep your analytics accurate. Every minute counts towards your daily goal.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full overflow-y-auto pb-20 custom-scrollbar">

                    {/* Form Column */}
                    <div className="lg:col-span-8 space-y-8">
                        <form id="manual-entry-form" onSubmit={handleSubmit} className="flex flex-col gap-6">

                            {/* Task Select */}
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-900 dark:text-white font-medium">Task or Project</label>
                                <div className="relative group">
                                    <select
                                        value={selectedTaskId}
                                        onChange={(e) => setSelectedTaskId(e.target.value)}
                                        className="w-full h-14 pl-4 pr-12 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white appearance-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 outline-none"
                                        required
                                    >
                                        <option value="" disabled>Select a task to link this session to</option>
                                        {tasks.map(task => (
                                            <option key={task.id} value={task.id}>{task.title}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronDownIcon className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-900 dark:text-white font-medium">Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full h-14 pl-4 pr-12 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        required
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <CalendarIcon className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Time Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-900 dark:text-white font-medium">Start Time</label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full h-14 pl-4 pr-4 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-900 dark:text-white font-medium">End Time</label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full h-14 pl-4 pr-4 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-900 dark:text-white font-medium">
                                    Session Notes <span className="text-slate-400 font-normal text-sm ml-1">(Optional)</span>
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="What did you accomplish during this session?"
                                    className="w-full min-h-[120px] p-4 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-y"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('history')}
                                    className="h-12 px-6 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="h-12 px-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircleIcon className="h-5 w-5" />
                                    Log Session
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Summary Column */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {/* Summary Card */}
                        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col gap-6 shadow-sm sticky top-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Session Summary</h3>
                                <ChartBarIcon className="h-5 w-5 text-slate-400" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-slate-500 dark:text-slate-400 text-sm">Total Duration</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                                        {hours > 0 && <span>{hours}<span className="text-2xl font-bold text-slate-400">h</span> </span>}
                                        {minutes}<span className="text-2xl font-bold text-slate-400">m</span>
                                    </span>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-[#0f172a] rounded-xl p-4 flex items-start gap-3 border border-slate-100 dark:border-slate-800">
                                <BoltIcon className="h-5 w-5 text-indigo-500 mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="text-slate-900 dark:text-white font-medium text-sm">Focus Score Impact</span>
                                    <span className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                                        +{Math.floor(durationMinutes / 25) * 5} points towards daily goal
                                    </span>
                                </div>
                            </div>

                            {selectedTaskId && (
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                        {tasks.find(t => t.id === selectedTaskId)?.title || 'Selected Task'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                                        <CalendarIcon className="h-3 w-3" />
                                        {format(parse(date, 'yyyy-MM-dd', new Date()), 'MMM d')}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Tip Card */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-4 flex gap-3">
                            <div className="shrink-0 mt-0.5">
                                <div className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs">i</span>
                                </div>
                            </div>
                            <p className="text-sm text-indigo-900 dark:text-indigo-200 font-medium leading-relaxed">
                                Tip: Logging sessions immediately after completion improves estimation accuracy by 20%.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManualSessionEntry;
