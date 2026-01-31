// App.tsx
import { useAtom } from "jotai";
import { Toaster } from "sonner";
import {
  Timer,
  CheckSquare,
  History,
  BarChart3,
  Settings,
  Box,
  Sun,
  Moon
} from "lucide-react";
import { activeTabAtom, selectedTaskIdAtom, themeAtom, TabType } from "./atoms";
import "./App.css";
import PomodoroTimer from "./PomodoroTimer";
import TaskManager from "./TaskManager";
import SessionHistory from "./SessionHistory";
import SettingsPanel from "./SettingsPanel";
import AnalyticsDashboard from "./AnalyticsDashboard";
import GoalsManager from "./GoalsManager";

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'timer', label: 'Timer', icon: <Timer /> },
  { id: 'tasks', label: 'Tasks', icon: <CheckSquare /> },
  { id: 'goals', label: 'Goals', icon: <Box /> },
  { id: 'history', label: 'History', icon: <History /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 /> },
  { id: 'settings', label: 'Settings', icon: <Settings /> },
];

function App() {
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const [selectedTaskId, setSelectedTaskId] = useAtom(selectedTaskIdAtom);
  const [theme, setTheme] = useAtom(themeAtom);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
    // Switch to timer tab when a task is selected
    setActiveTab('timer');
  };

  return (
    <div className="app-container">
      <Toaster position="top-right" theme={theme === 'dark' ? 'dark' : 'light'} />
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo">
            <Box size={22} color="white" />
          </div>
          <h1>TimeBox</h1>
        </div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>

      <nav className="app-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <main className="app-main">
        <div className="fade-in">
          {activeTab === 'timer' && <PomodoroTimer selectedTaskId={selectedTaskId} onTaskSelect={setSelectedTaskId} />}
          {activeTab === 'tasks' && <TaskManager onSelectTask={handleTaskSelect} selectedTaskId={selectedTaskId} />}
          {activeTab === 'goals' && <GoalsManager />}
          {activeTab === 'history' && <SessionHistory />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
}

export default App;
