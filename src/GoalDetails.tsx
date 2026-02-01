
import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import {
    ArrowLeftIcon,
    ChartBarIcon,
    TrashIcon,
    FlagIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import {
    goalsAtom,
    activeGoalViewAtom,
    selectedGoalIdAtom,
    fetchGoalsAtom
} from './atoms';
import { apiService } from './apiService';

const GoalDetails: React.FC = () => {
    const [goals] = useAtom(goalsAtom);
    const [selectedGoalId] = useAtom(selectedGoalIdAtom);
    const [, setActiveView] = useAtom(activeGoalViewAtom);
    const [, fetchGoals] = useAtom(fetchGoalsAtom);

    const [isDeleting, setIsDeleting] = useState(false);

    const goal = goals.find(g => g.id === selectedGoalId);

    if (!goal) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <p>Goal not found</p>
                <button
                    onClick={() => setActiveView('list')}
                    className="mt-4 text-indigo-500 hover:underline"
                >
                    Back to Goals
                </button>
            </div>
        );
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        try {
            setIsDeleting(true);
            await apiService.deleteGoal(goal.id);
            toast.success('Goal deleted');
            await fetchGoals();
            setActiveView('list');
        } catch (error) {
            console.error("Error deleting goal", error);
            toast.error('Failed to delete goal');
        } finally {
            setIsDeleting(false);
        }
    };

    const progress = Math.min((goal.completed_pomodoros / goal.target_pomodoros) * 100, 100);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActiveView('list')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white truncate max-w-[200px] md:max-w-md">{goal.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
                        title="Delete Goal"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-3xl mx-auto flex flex-col gap-8">

                    {/* Main Stats Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <FlagIcon className="h-40 w-40 transform rotate-12 translate-x-10 -translate-y-10" />
                        </div>

                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider mb-3">
                                        {goal.category || 'General'}
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-black leading-tight">{goal.title}</h1>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-5xl font-black">{Math.round(progress)}%</span>
                                    <span className="text-indigo-200 font-medium">Complete</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-bold opacity-90">
                                    <span>{goal.completed_pomodoros} Pomodoros</span>
                                    <span>Target: {goal.target_pomodoros}</span>
                                </div>
                                <div className="h-4 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                                    <div
                                        className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)] rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${progress}% ` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-4">Motivation</h3>
                            <p className="text-slate-800 dark:text-slate-200 italic leading-relaxed text-lg">
                                "{goal.motivation || "No motivation set. You can do this!"}"
                            </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-lg">
                                    <CalendarIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Target Date</h4>
                                    <p className="font-bold text-slate-800 dark:text-white">
                                        {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'No date set'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 rounded-lg">
                                    <ChartBarIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Focus Time</h4>
                                    <p className="font-bold text-slate-800 dark:text-white">
                                        {Math.round((goal.completed_pomodoros * 25) / 60)} Hours
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions for Development/Debug */}
                    {/* 
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                <h3 className="font-bold mb-4">Debug Info</h3>
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl text-xs overflow-auto">
                    {JSON.stringify(goal, null, 2)}
                </pre>
            </div>
            */}
                </div>
            </div>
        </div>
    );
};

export default GoalDetails;
