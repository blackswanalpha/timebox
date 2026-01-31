// SettingsPanel.tsx
import React, { useState, useEffect } from 'react';
import { Settings, Clock, Shield, Save, Check, Loader2 } from 'lucide-react';
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
            <Settings size={24} />
            Settings
          </div>
        </div>
        <div className="empty-state">
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card settings-panel">
      <div className="card-header">
        <div className="card-title">
          <Settings size={24} />
          Settings
        </div>
      </div>
      
      <form onSubmit={handleSaveSettings}>
        <div className="settings-section">
          <div className="settings-section-title">
            <Clock size={18} />
            Timer Durations
          </div>
          
          <div className="settings-row">
            <div className="form-group">
              <label htmlFor="focus-minutes">Focus Duration</label>
              <input
                type="number"
                id="focus-minutes"
                min="1"
                max="60"
                value={focusMinutes}
                onChange={(e) => setFocusMinutes(parseInt(e.target.value) || 25)}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>minutes</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="short-break-minutes">Short Break</label>
              <input
                type="number"
                id="short-break-minutes"
                min="1"
                max="30"
                value={shortBreakMinutes}
                onChange={(e) => setShortBreakMinutes(parseInt(e.target.value) || 5)}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>minutes</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="long-break-minutes">Long Break</label>
              <input
                type="number"
                id="long-break-minutes"
                min="1"
                max="60"
                value={longBreakMinutes}
                onChange={(e) => setLongBreakMinutes(parseInt(e.target.value) || 15)}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>minutes</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="cycles-before-long-break">Cycles Before Long Break</label>
              <input
                type="number"
                id="cycles-before-long-break"
                min="1"
                max="10"
                value={cyclesBeforeLongBreak}
                onChange={(e) => setCyclesBeforeLongBreak(parseInt(e.target.value) || 4)}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>focus sessions</small>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <div className="settings-section-title">
            <Shield size={18} />
            Behavior
          </div>
          
          <div className="form-group checkbox-group">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span style={{ marginLeft: '12px', fontWeight: 500 }}>
                Strict Mode
              </span>
            </label>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '60px' }}>
              Prevents skipping breaks
            </small>
          </div>
          
          <div className="form-group checkbox-group" style={{ marginTop: '16px' }}>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={autoStartBreaks}
                onChange={(e) => setAutoStartBreaks(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span style={{ marginLeft: '12px', fontWeight: 500 }}>
                Auto-start Breaks
              </span>
            </label>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '60px' }}>
              Automatically start break timers
            </small>
          </div>
        </div>
        
        <div className="settings-action">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </button>
          
          {saveSuccess && (
            <div className="save-success">
              <Check size={16} />
              Settings saved!
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SettingsPanel;