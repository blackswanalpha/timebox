// TaskManager.tsx
import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { 
  Plus, 
  Target, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Edit2, 
  Trash2, 
  X, 
  Check,
  Play,
  ListTodo,
  CheckSquare
} from 'lucide-react';
import { apiService } from './apiService';
import { TaskWithPomodoros, tasksAtom, tasksLoadingAtom, fetchTasksAtom } from './atoms';

interface TaskManagerProps {
  onSelectTask?: (taskId: string) => void;
  selectedTaskId?: string;
}

type TabType = 'todo' | 'done';

const TaskManager: React.FC<TaskManagerProps> = ({ onSelectTask, selectedTaskId }) => {
  const [tasks] = useAtom(tasksAtom);
  const [isLoading] = useAtom(tasksLoadingAtom);
  const [, fetchTasks] = useAtom(fetchTasksAtom);
  
  const [activeTab, setActiveTab] = useState<TabType>('todo');
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEstimate, setNewTaskEstimate] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editEstimate, setEditEstimate] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  
  // Delete confirmation state
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) return;
    
    try {
      setIsSubmitting(true);
      await apiService.createTask(
        'default_user', 
        newTaskTitle.trim(), 
        newTaskEstimate
      );
      
      toast.success('Task created successfully');
      // Reload tasks to get the updated list with pomodoro counts
      await fetchTasks();
      
      setNewTaskTitle('');
      setNewTaskEstimate(1);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    if (onSelectTask) {
      onSelectTask(taskId);
      toast.info('Task selected for focus');
    }
  };

  const startEditing = (task: TaskWithPomodoros) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditEstimate(task.estimated_pomodoros);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditEstimate(1);
    setIsEditing(false);
  };

  const handleUpdateTask = async (taskId: string) => {
    if (!editTitle.trim()) return;
    
    try {
      setIsEditing(true);
      await apiService.updateTask(taskId, {
        title: editTitle.trim(),
        estimated_pomodoros: editEstimate
      });
      
      toast.success('Task updated');
      // Reload tasks to get updated data
      await fetchTasks();
      
      setEditingTaskId(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleToggleComplete = async (task: TaskWithPomodoros) => {
    try {
      const newStatus = !task.completed;
      await apiService.updateTask(task.id, {
        completed: newStatus
      });
      
      toast.success(newStatus ? 'Task completed!' : 'Task reopened');
      // Reload tasks to get updated data
      await fetchTasks();
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Failed to update task status');
    }
  };

  const confirmDelete = (taskId: string) => {
    setDeletingTaskId(taskId);
  };

  const cancelDelete = () => {
    setDeletingTaskId(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsDeleting(true);
      await apiService.deleteTask(taskId);
      
      toast.success('Task deleted');
      // Reload tasks to get updated list
      await fetchTasks();
      
      setDeletingTaskId(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'todo') return !task.completed;
    return task.completed;
  });

  const todoCount = tasks.filter(t => !t.completed).length;
  const doneCount = tasks.filter(t => t.completed).length;

  return (
    <div className="card task-manager">
      <div className="card-header task-header-row">
        <div className="card-title">
          <Target size={24} />
          Tasks
        </div>
        <div className="task-tabs">
          <button 
            className={`task-tab ${activeTab === 'todo' ? 'active' : ''}`}
            onClick={() => setActiveTab('todo')}
          >
            <ListTodo size={16} />
            Todo
            <span className="tab-count">{todoCount}</span>
          </button>
          <button 
            className={`task-tab ${activeTab === 'done' ? 'active' : ''}`}
            onClick={() => setActiveTab('done')}
          >
            <CheckSquare size={16} />
            Done
            <span className="tab-count">{doneCount}</span>
          </button>
        </div>
      </div>
      
      <form onSubmit={handleCreateTask} className="task-input-container">
        <div className="task-input-wrapper">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="task-main-input"
            required
          />
          <div className="task-input-controls">
             <div className="est-control">
               <Clock size={14} className="text-muted" />
               <input
                type="number"
                min="1"
                max="20"
                value={newTaskEstimate}
                onChange={(e) => setNewTaskEstimate(parseInt(e.target.value) || 1)}
                title="Estimated Pomodoros"
                className="est-input"
              />
             </div>
            <button 
              type="submit" 
              className="btn-icon-primary"
              disabled={isSubmitting || !newTaskTitle.trim()}
              title="Add Task"
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
      
      <div className="tasks-list-container">
        {isLoading && tasks.length === 0 ? (
          <div className="loading-state">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p>Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            {activeTab === 'todo' ? (
              <>
                <Target size={48} className="text-muted" />
                <p>No pending tasks. You're all caught up!</p>
              </>
            ) : (
              <>
                <CheckCircle2 size={48} className="text-muted" />
                <p>No completed tasks yet.</p>
              </>
            )}
          </div>
        ) : (
          <div className="tasks-list">
            {filteredTasks.map(task => (
              <div 
                key={task.id} 
                className={`task-item ${selectedTaskId === task.id ? 'selected' : ''} ${task.completed ? 'completed' : ''}`}
              >
                {editingTaskId === task.id ? (
                  // Edit mode
                  <div className="task-edit-mode">
                    <div className="task-edit-inputs">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Task title"
                        className="edit-title-input"
                        autoFocus
                      />
                      <div className="edit-meta">
                        <Clock size={14} />
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={editEstimate}
                          onChange={(e) => setEditEstimate(parseInt(e.target.value) || 1)}
                          className="edit-est-input"
                        />
                      </div>
                    </div>
                    <div className="task-edit-actions">
                      <button 
                        onClick={() => handleUpdateTask(task.id)}
                        className="btn-icon-success"
                        disabled={isEditing || !editTitle.trim()}
                        title="Save"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        onClick={cancelEditing}
                        className="btn-icon-secondary"
                        disabled={isEditing}
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : deletingTaskId === task.id ? (
                  // Delete confirmation mode
                  <div className="task-delete-mode">
                    <span className="delete-text">Delete "{task.title}"?</span>
                    <div className="task-edit-actions">
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="btn-icon-danger"
                        disabled={isDeleting}
                        title="Confirm Delete"
                      >
                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                      <button 
                        onClick={cancelDelete}
                        className="btn-icon-secondary"
                        disabled={isDeleting}
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="task-left">
                      <button
                        onClick={() => handleToggleComplete(task)}
                        className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                        title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {task.completed ? <Check size={14} /> : null}
                      </button>
                      
                      <div className="task-content">
                        <span className="task-title">{task.title}</span>
                        <div className="task-pills">
                          <span className="pill pill-pomodoro">
                            <Clock size={10} />
                            {task.actual_pomodoros}/{task.estimated_pomodoros}
                          </span>
                          {selectedTaskId === task.id && (
                             <span className="pill pill-active">
                               Active
                             </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="task-actions-hover">
                      {!task.completed && (
                        <button 
                          onClick={() => handleTaskSelect(task.id)}
                          className={`btn-action-primary ${selectedTaskId === task.id ? 'active' : ''}`}
                          title={selectedTaskId === task.id ? "Currently Active" : "Focus on this task"}
                          disabled={selectedTaskId === task.id}
                        >
                          <Play size={16} fill={selectedTaskId === task.id ? "currentColor" : "none"} />
                        </button>
                      )}
                      
                      <div className="secondary-actions">
                        <button 
                          onClick={() => startEditing(task)}
                          className="btn-icon-ghost"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(task.id)}
                          className="btn-icon-ghost danger"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;
