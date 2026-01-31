// GoalsManager.tsx
import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import {
    Trophy,
    Plus,
    Loader2,
    CheckCircle2,
    Circle,
    BarChart,
    Target
} from 'lucide-react';
import { apiService } from './apiService';
import { goalsAtom, goalsLoadingAtom, fetchGoalsAtom } from './atoms';
import { Goal } from './types';

const GoalsManager: React.FC = () => {
    const [goals] = useAtom(goalsAtom);
    const [isLoading] = useAtom(goalsLoadingAtom);
    const [, fetchGoals] = useAtom(fetchGoalsAtom);

    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState(10);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoalTitle.trim()) return;

        try {
            setIsSubmitting(true);
            await apiService.createGoal('default_user', newGoalTitle.trim(), newGoalTarget);
            toast.success('Goal created successfully');
            await fetchGoals();
            setNewGoalTitle('');
            setNewGoalTarget(10);
        } catch (error) {
            console.error('Error creating goal:', error);
            toast.error('Failed to create goal');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card goals-manager">
            <div className="card-header">
                <div className="card-title">
                    <Trophy size={24} />
                    Long-term Goals
                </div>
            </div>

            <form onSubmit={handleCreateGoal} className="task-input-container">
                <div className="task-input-wrapper">
                    <input
                        type="text"
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        placeholder="Set a new goal (e.g., Master Rust)..."
                        className="task-main-input"
                        required
                    />
                    <div className="task-input-controls">
                        <div className="est-control">
                            <Target size={14} className="text-muted" />
                            <input
                                type="number"
                                min="1"
                                value={newGoalTarget}
                                onChange={(e) => setNewGoalTarget(parseInt(e.target.value) || 1)}
                                title="Target Pomodoros"
                                className="est-input"
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-icon-primary"
                            disabled={isSubmitting || !newGoalTitle.trim()}
                        >
                            {isSubmitting ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Plus size={20} />
                            )}
                        </button>
                    </div>
                </div>
            </form>

            <div className="goals-list">
                {isLoading && goals.length === 0 ? (
                    <div className="loading-state">
                        <Loader2 size={32} className="animate-spin text-primary" />
                        <p>Loading goals...</p>
                    </div>
                ) : goals.length === 0 ? (
                    <div className="empty-state">
                        <Trophy size={48} className="text-muted" />
                        <p>No goals set yet. What do you want to achieve?</p>
                    </div>
                ) : (
                    <div className="tasks-list">
                        {goals.map((goal: Goal) => {
                            const progress = Math.min((goal.completed_pomodoros / goal.target_pomodoros) * 100, 100);
                            return (
                                <div key={goal.id} className={`task-item ${goal.completed ? 'completed' : ''}`}>
                                    <div className="task-left">
                                        <div className="goal-icon">
                                            {goal.completed ? <CheckCircle2 size={20} className="text-success" /> : <Circle size={20} className="text-muted" />}
                                        </div>
                                        <div className="task-content" style={{ flex: 1 }}>
                                            <span className="task-title">{goal.title}</span>
                                            <div className="goal-progress-bar" style={{
                                                height: '4px',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '2px',
                                                marginTop: '8px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${progress}%`,
                                                    height: '100%',
                                                    background: 'var(--color-primary)',
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                            <div className="task-pills" style={{ marginTop: '4px' }}>
                                                <span className="pill">
                                                    <BarChart size={10} />
                                                    {goal.completed_pomodoros} / {goal.target_pomodoros} Pomodoros
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoalsManager;
