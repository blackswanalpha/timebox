// GoalsManager.tsx
import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrophyIcon,
  PlusIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  goalsAtom,
  goalsLoadingAtom,
  fetchGoalsAtom,
  activeGoalViewAtom,
  selectedGoalIdAtom
} from './atoms';
import { Goal } from './types';
import CreateGoal from './CreateGoal';
import GoalDetails from './GoalDetails';

const GoalsManager: React.FC = () => {
  const [goals] = useAtom(goalsAtom);
  const [isLoading] = useAtom(goalsLoadingAtom);
  const [, fetchGoals] = useAtom(fetchGoalsAtom);
  const [activeView, setActiveView] = useAtom(activeGoalViewAtom);
  const [, setSelectedGoalId] = useAtom(selectedGoalIdAtom);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleGoalClick = (goalId: string) => {
    setSelectedGoalId(goalId);
    setActiveView('details');
  };

  if (activeView === 'create') {
    return <CreateGoal />;
  }

  if (activeView === 'details') {
    return <GoalDetails />;
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Work': return 'text-indigo-500 bg-indigo-500/10';
      case 'Personal': return 'text-emerald-500 bg-emerald-500/10';
      case 'Study': return 'text-amber-500 bg-amber-500/10';
      default: return 'text-indigo-500 bg-indigo-500/10';
    }
  };

  const getProgressColor = (progress: number, category?: string) => {
    if (progress >= 100) return 'bg-emerald-500';

    switch (category) {
      case 'Work': return 'bg-indigo-500';
      case 'Personal': return 'bg-emerald-500';
      case 'Study': return 'bg-amber-500';
      default: return 'bg-indigo-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-1"
        >
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Long-term Goals</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Track your progress towards mastery</p>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveView('create')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="hidden sm:inline">New Goal</span>
        </motion.button>
      </div>

      {/* Goals List */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {isLoading && goals.length === 0 ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-slate-400 gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <ArrowPathIcon className="h-10 w-10 text-indigo-500" />
              </motion.div>
              <p className="font-medium">Loading goals...</p>
            </motion.div>
          ) : goals.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-70"
            >
              <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-full mb-2">
                <TrophyIcon className="h-16 w-16 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">No goals yet</h3>
              <p className="font-medium text-center max-w-[250px] text-slate-500">
                Start by setting a big objective you want to achieve.
              </p>
              <button
                onClick={() => setActiveView('create')}
                className="mt-4 text-indigo-500 font-bold hover:underline"
              >
                Create your first goal
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {goals.map((goal: Goal, index) => {
                const progress = Math.min((goal.completed_pomodoros / goal.target_pomodoros) * 100, 100);
                const categoryColor = getCategoryColor(goal.category);
                const progressColor = getProgressColor(progress, goal.category);

                return (
                  <motion.div
                    key={goal.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                    onClick={() => handleGoalClick(goal.id)}
                    className="group relative p-6 rounded-3xl border bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all cursor-pointer flex flex-col gap-5 backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ rotate: 10 }}
                          className={`size-12 rounded-xl flex items-center justify-center ${categoryColor}`}
                        >
                          <TrophyIcon className="h-6 w-6" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight mb-1 line-clamp-1">
                            {goal.title}
                          </h3>
                          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {goal.category || 'General'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-800 dark:text-white">
                            {goal.completed_pomodoros}
                          </span>
                          <span className="text-sm font-bold text-slate-400">
                            / {goal.target_pomodoros}
                          </span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${categoryColor}`}>
                          {Math.round(progress)}%
                        </span>
                      </div>

                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${progressColor}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <ChartBarIcon className="h-4 w-4" />
                        <span>{Math.round((goal.completed_pomodoros * 25) / 60)}h Focused</span>
                      </div>
                      <span className="text-xs font-bold text-indigo-500 group-hover:underline">
                        Details &rarr;
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GoalsManager;
