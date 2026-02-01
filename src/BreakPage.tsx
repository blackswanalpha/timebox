// BreakPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import {
    InformationCircleIcon,
    ChevronRightIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { activeTabAtom, timerStatusAtom } from './atoms';
import { useTimer } from './useTimer';
import { apiService } from './apiService';
import { getRandomSuggestion, BreakActivity } from './breakSuggestions';

const BreakPage: React.FC = () => {
    const [, setActiveTab] = useAtom(activeTabAtom);
    const [timerStatus] = useAtom(timerStatusAtom);
    const {
        minutes,
        seconds,
        stopTimer,
        startTimer,
        isActive
    } = useTimer();

    const [currentSuggestion] = useState<BreakActivity>(getRandomSuggestion());
    const [showHowTo, setShowHowTo] = useState(false);
    const [strictMode, setStrictMode] = useState(false);

    // Load settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await apiService.getSettings('default_user');
                setStrictMode(settings.strict_mode);

                // If auto-start is enabled and timer isn't already running, start it
                if (settings.auto_start_breaks && !isActive) {
                    // Determine session type: if we just came from focus, it should be break
                    // The backend session_type might still be FOCUS if stopTimer hasn't propagated,
                    // but usually we want to start a SHORT_BREAK or LONG_BREAK here.
                    // For now, we'll use SHORT_BREAK as default or check cycles if we want to be fancy.
                    const nextType = timerStatus.session_type === 'LONG_BREAK' ? 'LONG_BREAK' : 'SHORT_BREAK';
                    startTimer(undefined, nextType);
                }
            } catch (error) {
                console.error('Error loading settings in BreakPage:', error);
            }
        };

        loadSettings();
    }, [isActive, startTimer, timerStatus.session_type]);

    const handleSkip = async () => {
        await stopTimer();
        setActiveTab('timer');
    };

    const formatTime = (time: number) => {
        return time.toString().padStart(2, '0');
    };

    // Calculate progress for the circular indicator
    const progress = useMemo(() => {
        const totalSeconds = (timerStatus.duration_minutes || 5) * 60;
        const currentSeconds = minutes * 60 + seconds;
        const elapsed = totalSeconds - currentSeconds;
        return Math.min(100, Math.max(0, (elapsed / totalSeconds) * 100));
    }, [minutes, seconds, timerStatus.duration_minutes]);

    // Calculate stroke dash offset for SVG circle
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (circumference * progress) / 100;

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] w-full max-w-2xl mx-auto py-12 px-4">
            {/* Decorative Background Element */}
            <div className="fixed inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none -z-10"></div>

            {/* Headline Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
            >
                <h1 className="text-slate-800 dark:text-white text-4xl md:text-5xl font-bold leading-tight mb-2">
                    {timerStatus.session_type === 'LONG_BREAK' ? 'Long Break' : 'Break Time'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Relax, recharge, and take a moment for yourself.
                </p>
            </motion.div>

            {/* Timer Section with Progress Ring */}
            <div className="relative w-64 h-64 mb-8">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                        className="text-slate-100 dark:text-slate-800"
                        cx="50"
                        cy="50"
                        fill="none"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <motion.circle
                        className="text-indigo-600 dark:text-indigo-500"
                        cx="50"
                        cy="50"
                        fill="none"
                        r="45"
                        stroke="currentColor"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: "linear" }}
                        strokeLinecap="round"
                        strokeWidth="4"
                    />
                </svg>

                {/* Timer Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex text-4xl md:text-5xl font-bold tabular-nums text-slate-800 dark:text-white">
                        <span>{formatTime(minutes)}</span>
                        <span className="mx-1 opacity-50">:</span>
                        <span>{formatTime(seconds)}</span>
                    </div>
                </div>
            </div>

            {/* Breathing Prompt or Start Button */}
            {!isActive && timerStatus.time_remaining === 0 && (
                <div className="flex flex-col items-center gap-4 mb-4">
                    <button
                        onClick={() => startTimer(undefined, timerStatus.session_type === 'LONG_BREAK' ? 'LONG_BREAK' : 'SHORT_BREAK')}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
                    >
                        Start Break
                    </button>
                </div>
            )}

            <div className="flex flex-col items-center gap-6 py-6 w-full">
                <div className="relative flex items-center justify-center">
                    <motion.div
                        animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute w-20 h-20 bg-indigo-400/20 rounded-full"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-12 h-12 bg-indigo-500/40 rounded-full"
                    />
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-lg font-medium italic text-center">
                    Take a deep breath in... and out.
                </p>
            </div>

            {/* Stretch Suggestion Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full mt-4"
            >
                <div className="flex flex-col md:flex-row items-stretch gap-6 rounded-3xl bg-white dark:bg-slate-800/50 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800/50 backdrop-blur-sm">
                    <div className="flex-1 flex flex-col gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1 px-2 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                    {currentSuggestion.subtitle}
                                </div>
                            </div>
                            <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-1">
                                {currentSuggestion.title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                {currentSuggestion.description}
                            </p>
                        </div>

                        <button
                            onClick={() => setShowHowTo(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-white text-sm font-bold w-fit hover:bg-indigo-100 dark:hover:bg-slate-700 transition-colors group"
                        >
                            <InformationCircleIcon className="h-5 w-5" />
                            <span>How to perform</span>
                        </button>
                    </div>

                    <div
                        className="w-full md:w-40 aspect-square md:aspect-auto rounded-2xl bg-indigo-100 dark:bg-slate-800 overflow-hidden relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-blue-500/10 z-0"></div>
                        <img
                            src={currentSuggestion.imageUrl}
                            alt={currentSuggestion.title}
                            className="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Skip Action (only if not strict mode) */}
            {!strictMode && (
                <div className="mt-10">
                    <button
                        onClick={handleSkip}
                        className="flex items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-semibold py-2 px-4 group"
                    >
                        <span>Skip break and resume work</span>
                        <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            )}

            {/* How-To Modal */}
            <AnimatePresence>
                {showHowTo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHowTo(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold">How to perform</h3>
                                <button
                                    onClick={() => setShowHowTo(false)}
                                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-8">
                                <div className="space-y-4">
                                    {currentSuggestion.howTo.map((step, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                                {index + 1}
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300">
                                                {step}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                                <button
                                    onClick={() => setShowHowTo(false)}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                                >
                                    Got it
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BreakPage;
