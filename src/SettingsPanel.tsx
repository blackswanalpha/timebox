// SettingsPanel.tsx
import React, { useState, useEffect } from 'react';
import { Cog6ToothIcon, ClockIcon, ShieldCheckIcon, ArrowDownOnSquareIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { apiService } from './apiService';
import { PomodoroSettings } from './types';

const SettingsPanel: React.FC = () => {
  const [, setSettingsLocal] = useState<PomodoroSettings | null>(null);
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [cyclesBeforeLongBreak, setCyclesBeforeLongBreak] = useState(4);
  const [strictMode, setStrictMode] = useState(false);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const loadedSettings = await apiService.getSettings('default_user');
      setSettingsLocal(loadedSettings);
      
      // Set form values
      setFocusMinutes(loadedSettings.focus_minutes);
      setShortBreakMinutes(loadedSettings.short_break_minutes);
      setLongBreakMinutes(loadedSettings.long_break_minutes);
      setCyclesBeforeLongBreak(loadedSettings.cycles_before_long_break);
      setStrictMode(loadedSettings.strict_mode);
      setAutoStartBreaks(loadedSettings.auto_start_breaks);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      
      await apiService.updateSettings({
        user_id: 'default_user',
        focus_minutes: focusMinutes,
        short_break_minutes: shortBreakMinutes,
        long_break_minutes: longBreakMinutes,
        cycles_before_long_break: cyclesBeforeLongBreak,
        strict_mode: strictMode,
        auto_start_breaks: autoStartBreaks
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Cog6ToothIcon className="h-6 w-6" />
            Settings
          </div>
        </div>
        <div className="empty-state">
          <ArrowPathIcon className="h-8 w-8 animate-spin" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Cog6ToothIcon className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">Settings</h2>
        </div>
      </div>
      
      <form onSubmit={handleSaveSettings} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
        {/* Timer Durations Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <ClockIcon className="h-4.5 w-4.5 text-indigo-500" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Timer Durations</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="focus-minutes" className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Focus Duration</label>
              <div className="relative">
                <input
                  type="number"
                  id="focus-minutes"
                  min="1"
                  max="60"
                  value={focusMinutes}
                  onChange={(e) => setFocusMinutes(parseInt(e.target.value) || 25)}
                  className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black text-indigo-600 dark:text-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-400 pointer-events-none">Min</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="short-break-minutes" className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Short Break</label>
              <div className="relative">
                <input
                  type="number"
                  id="short-break-minutes"
                  min="1"
                  max="30"
                  value={shortBreakMinutes}
                  onChange={(e) => setShortBreakMinutes(parseInt(e.target.value) || 5)}
                  className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black text-emerald-600 dark:text-emerald-400 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-400 pointer-events-none">Min</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="long-break-minutes" className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Long Break</label>
              <div className="relative">
                <input
                  type="number"
                  id="long-break-minutes"
                  min="1"
                  max="60"
                  value={longBreakMinutes}
                  onChange={(e) => setLongBreakMinutes(parseInt(e.target.value) || 15)}
                  className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black text-blue-600 dark:text-blue-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-400 pointer-events-none">Min</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="cycles-before-long-break" className="block text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Cycles Before Long Break</label>
              <div className="relative">
                <input
                  type="number"
                  id="cycles-before-long-break"
                  min="1"
                  max="10"
                  value={cyclesBeforeLongBreak}
                  onChange={(e) => setCyclesBeforeLongBreak(parseInt(e.target.value) || 4)}
                  className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black text-amber-600 dark:text-amber-400 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-400 pointer-events-none">Cycles</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Behavior Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheckIcon className="h-4.5 w-4.5 text-indigo-500" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">App Behavior</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Strict Mode</p>
                <p className="text-xs text-slate-400">Prevents skipping breaks to ensure health</p>
              </div>
              <button
                type="button"
                onClick={() => setStrictMode(!strictMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${strictMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${strictMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Auto-start Breaks</p>
                <p className="text-xs text-slate-400">Automatically start break timers after focus</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoStartBreaks(!autoStartBreaks)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoStartBreaks ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoStartBreaks ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>
        
        {/* Footer Actions */}
        <div className="pt-6 flex flex-col sm:flex-row items-center gap-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            type="submit" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <ArrowDownOnSquareIcon className="h-5 w-5" />}
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
          
          {saveSuccess && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold animate-fade-in">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded-full">
                <CheckIcon className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm">Settings saved!</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SettingsPanel;