import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { useState, useEffect } from 'react';
import {
  clockoutModalOpenAtom,
  selectedReflectionDateAtom,
  calendarViewMonthAtom,
  monthReflectionsAtom,
  reflectionTitleAtom,
  reflectionDurationAtom,
  reflectionPurposeAtom,
  reflectionNotesAtom,
  reflectionMoodAtom,
  reflectionProductivityAtom,
  fetchDayActivitiesAtom,
  fetchReflectionAtom,
  fetchMonthReflectionsAtom,
  saveReflectionAtom
} from '../atoms';
import DailyTimeline from './DailyTimeline';
import { toast } from 'sonner';

function RatingButton({ 
  value, 
  selected, 
  onClick, 
  label 
}: { 
  value: number; 
  selected?: number; 
  onClick: (v: number) => void; 
  label: string;
}) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
        selected === value
          ? 'bg-amber-600 text-white scale-110 shadow-lg shadow-amber-500/30'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
      }`}
      title={label}
      type="button"
    >
      {value}
    </button>
  );
}

export default function ClockoutModal() {
  const [isOpen, setIsOpen] = useAtom(clockoutModalOpenAtom);
  const [selectedDate, setSelectedDate] = useAtom(selectedReflectionDateAtom);
  const [monthReflections] = useAtom(monthReflectionsAtom);
  const [title, setTitle] = useAtom(reflectionTitleAtom);
  const [duration, setDuration] = useAtom(reflectionDurationAtom);
  const [purpose, setPurpose] = useAtom(reflectionPurposeAtom);
  const [notes, setNotes] = useAtom(reflectionNotesAtom);
  const [mood, setMood] = useAtom(reflectionMoodAtom);
  const [productivity, setProductivity] = useAtom(reflectionProductivityAtom);
  const [, fetchDayActivities] = useAtom(fetchDayActivitiesAtom);
  const [, fetchReflection] = useAtom(fetchReflectionAtom);
  const [, fetchMonthReflections] = useAtom(fetchMonthReflectionsAtom);
  const [, saveReflection] = useAtom(saveReflectionAtom);
  const [currentMonth, setCurrentMonth] = useAtom(calendarViewMonthAtom);

  const [isSaving, setIsSaving] = useState(false);

  // Load data when date changes
  useEffect(() => {
    if (isOpen) {
      fetchDayActivities();
      fetchReflection();
      setCurrentMonth(selectedDate);
    }
  }, [isOpen, selectedDate, fetchDayActivities, fetchReflection]);

  // Load month reflections when month changes
  useEffect(() => {
    if (isOpen) {
      fetchMonthReflections();
    }
  }, [isOpen, currentMonth, fetchMonthReflections]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveReflection();
      toast.success('Reflection saved successfully!');
    } catch (error) {
      toast.error('Failed to save reflection');
    } finally {
      setIsSaving(false);
    }
  };

  const hasReflectionForDate = (date: Date) => {
    return monthReflections.some(r => {
      const reflectionDate = parseISO(r.reflection_date);
      return isSameDay(reflectionDate, date);
    });
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[10000] p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl">
                  <SparklesIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    Daily Reflection
                  </h2>
                  <p className="text-sm text-slate-500">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                type="button"
              >
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Calendar & Timeline */}
                <div className="space-y-6">
                  {/* Calendar */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={handlePrevMonth}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        type="button"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {format(currentMonth, 'MMMM yyyy')}
                      </span>
                      <button
                        onClick={handleNextMonth}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        type="button"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                      {weekDays.map(day => (
                        <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
                          {day}
                        </div>
                      ))}
                      {days.map((day, index) => {
                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const hasReflection = hasReflectionForDate(day);
                        
                        return (
                          <motion.button
                            key={day.toISOString()}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.01 }}
                            onClick={() => handleDateSelect(day)}
                            className={`
                              relative h-9 w-9 rounded-lg text-sm font-medium transition-all
                              ${isSelected 
                                ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30' 
                                : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }
                              ${!isCurrentMonth && 'opacity-40'}
                            `}
                            type="button"
                          >
                            {format(day, 'd')}
                            {hasReflection && !isSelected && (
                              <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <DailyTimeline />
                  </div>
                </div>

                {/* Right Column - Reflection Form */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-amber-500" />
                    Reflection
                  </h3>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Day Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Productive coding day"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-slate-100"
                    />
                  </div>

                  {/* Duration Reflection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Duration Reflection
                    </label>
                    <textarea
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="How did you spend your time today?"
                      rows={2}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-slate-100 resize-none"
                    />
                  </div>

                  {/* Purpose Reflection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Purpose & Goals
                    </label>
                    <textarea
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="What was your main focus or purpose today?"
                      rows={2}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-slate-100 resize-none"
                    />
                  </div>

                  {/* General Notes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Additional Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any other thoughts or observations..."
                      rows={2}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-slate-100 resize-none"
                    />
                  </div>

                  {/* Mood Rating */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Mood Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <RatingButton
                          key={value}
                          value={value}
                          selected={mood}
                          onClick={setMood}
                          label={value === 1 ? 'Very Low' : value === 5 ? 'Very High' : 'Neutral'}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>Very Low</span>
                      <span>Very High</span>
                    </div>
                  </div>

                  {/* Productivity Rating */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Productivity Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <RatingButton
                          key={value}
                          value={value}
                          selected={productivity}
                          onClick={setProductivity}
                          label={value === 1 ? 'Very Low' : value === 5 ? 'Very High' : 'Neutral'}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>Very Low</span>
                      <span>Very High</span>
                    </div>
                  </div>

                  {/* Save Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    type="button"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-4 w-4" />
                        Save Reflection
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
