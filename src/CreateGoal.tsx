
import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import {
    FlagIcon,
    BriefcaseIcon,
    AcademicCapIcon,
    UserIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import {
    goalTitleAtom,
    goalTargetAtom,
    goalCategoryAtom,
    goalMotivationAtom,
    goalTargetDateAtom,
    activeGoalViewAtom,
    fetchGoalsAtom
} from './atoms';
import { apiService } from './apiService';

import { DatePicker } from './components/ui/DatePicker';

const CreateGoal: React.FC = () => {
    const [title, setTitle] = useAtom(goalTitleAtom);
    const [target, setTarget] = useAtom(goalTargetAtom);
    const [category, setCategory] = useAtom(goalCategoryAtom);
    const [motivation, setMotivation] = useAtom(goalMotivationAtom);
    const [targetDateStr, setTargetDateStr] = useAtom(goalTargetDateAtom);
    const [, setActiveView] = useAtom(activeGoalViewAtom);
    const [, fetchGoals] = useAtom(fetchGoalsAtom);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Convert atom string to Date object for the picker
    const targetDate = targetDateStr ? new Date(targetDateStr) : undefined;

    const setTargetDate = (date?: Date) => {
        setTargetDateStr(date ? date.toISOString().split('T')[0] : '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            setIsSubmitting(true);

            // Convert date to ISO string with time if needed, or just pass date string
            // Backend expects Option<DateTime<Utc>> which creates from RFC3339 string usually.
            // If we pass 'YYYY-MM-DD', we might need to append time or handle it.
            // JavaScript Date toISOString() uses UTC.
            // Let's create a date object from the input value (which is local yyyy-mm-dd)
            let isoDate: string | undefined = undefined;
            if (targetDateStr) {
                const d = new Date(targetDateStr);
                isoDate = d.toISOString();
            }

            await apiService.createGoal(
                'default_user',
                title.trim(),
                target,
                category,
                motivation,
                isoDate
            );

            toast.success('Goal created successfully');
            await fetchGoals();

            // Reset form
            setTitle('');
            setTarget(10);
            setMotivation('');
            setTargetDateStr('');

            // Go back to list
            setActiveView('list');
        } catch (error) {
            console.error('Error creating goal:', error);
            toast.error('Failed to create goal');
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = [
        { id: 'Work', icon: <BriefcaseIcon className="h-5 w-5" />, color: 'bg-indigo-600' },
        { id: 'Personal', icon: <UserIcon className="h-5 w-5" />, color: 'bg-emerald-600' },
        { id: 'Study', icon: <AcademicCapIcon className="h-5 w-5" />, color: 'bg-amber-600' }
    ];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Set a New Goal</h2>
                <button
                    onClick={() => setActiveView('list')}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:px-20 md:py-10">
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Goal Name
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Master Rust Programming"
                            className="w-full text-3xl font-bold bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 py-2 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-all text-slate-800 dark:text-white"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Category
                        </label>
                        <div className="flex gap-4 flex-wrap">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex items - center gap - 2 px - 5 py - 2.5 rounded - xl border transition - all ${category === cat.id
                                            ? `${cat.color} text-white border-transparent shadow-lg shadow-indigo-500/20 scale-105`
                                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        } `}
                                >
                                    {cat.icon}
                                    <span className="font-medium">{cat.id}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Target Pomodoros
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FlagIcon className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    value={target}
                                    onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-lg"
                                />
                            </div>
                            <p className="text-xs text-slate-500 ml-1">
                                Estimated focus time: {Math.round((target * 25) / 60)} hours
                            </p>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Target Date
                            </label>
                            <DatePicker
                                date={targetDate}
                                setDate={setTargetDate}
                                className="py-4"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Motivation
                        </label>
                        <textarea
                            value={motivation}
                            onChange={(e) => setMotivation(e.target.value)}
                            placeholder="Why does this goal matter to you?"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all min-h-[120px] resize-none"
                        />
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button
                            type="submit"
                            disabled={isSubmitting || !title.trim()}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Goal'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveView('list')}
                            className="px-8 py-4 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGoal;
