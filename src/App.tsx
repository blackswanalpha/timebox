// App.tsx
import React from "react";
import { useAtom } from "jotai";
import { Toaster } from "sonner";
import {
  ClockIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CubeIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { activeTabAtom, selectedTaskIdAtom, themeAtom, TabType } from "./atoms";
import "./App.css";
import TitleBar from "./TitleBar";
import PomodoroTimer from "./PomodoroTimer";
import TaskManager from "./TaskManager";
import SessionHistory from "./SessionHistory";
import SettingsPanel from "./SettingsPanel";
import AnalyticsDashboard from "./AnalyticsDashboard";
import GoalsManager from "./GoalsManager";
import ManualSessionEntry from "./ManualSessionEntry";

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'timer', label: 'Timer', icon: <ClockIcon className="h-5.5 w-5.5" /> },
  { id: 'tasks', label: 'Tasks', icon: <CheckBadgeIcon className="h-5.5 w-5.5" /> },
  { id: 'goals', label: 'Goals', icon: <CubeIcon className="h-5.5 w-5.5" /> },
  { id: 'history', label: 'History', icon: <ArrowPathIcon className="h-5.5 w-5.5" /> },
  { id: 'analytics', label: 'Analytics', icon: <ChartBarIcon className="h-5.5 w-5.5" /> },
  { id: 'settings', label: 'Settings', icon: <Cog6ToothIcon className="h-5.5 w-5.5" /> },
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
    setActiveTab('timer');
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'timer':
        return <PomodoroTimer key="timer" selectedTaskId={selectedTaskId} onTaskSelect={setSelectedTaskId} />;
      case 'tasks':
        return <TaskManager key="tasks" onSelectTask={handleTaskSelect} selectedTaskId={selectedTaskId} />;
      case 'goals':
        return <GoalsManager key="goals" />;
      case 'history':
        return <SessionHistory key="history" />;
      case 'manual-entry':
        return <ManualSessionEntry key="manual-entry" />;
      case 'analytics':
        return <AnalyticsDashboard key="analytics" />;
      case 'settings':
        return <SettingsPanel key="settings" />;
      default:
        return <PomodoroTimer key="timer" selectedTaskId={selectedTaskId} onTaskSelect={setSelectedTaskId} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <TitleBar />
      <Toaster position="top-right" theme={theme === 'dark' ? 'dark' : 'light'} />

      <div className="flex h-screen pt-8"> {/* pt-8 for titlebar */}
        {/* Sidebar Navigation */}
        <nav className="w-14 md:w-64 bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-800 flex flex-col items-center md:items-stretch py-6 px-4 z-10 relative">
          <div className="flex items-center gap-3 px-2 mb-10 overflow-hidden">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 flex-shrink-0"
            >
              <CubeIcon className="h-6 w-6 text-white" />
            </motion.div>
            <h1 className="text-xl font-bold tracking-tight hidden md:block">TimeBox</h1>
          </div>

          <div className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`group relative w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
              >
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`relative z-10 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110 group-active:scale-95'} transition-transform duration-200`}>
                  {item.icon}
                </span>
                <span className="relative z-10 font-medium hidden md:block">{item.label}</span>
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTabDot"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 hidden md:block relative z-10"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
            <motion.button
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200"
              onClick={toggleTheme}
            >
              <div className="transition-transform duration-300">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme}
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === 'light' ? <MoonIcon className="h-5.5 w-5.5" /> : <SunIcon className="h-5.5 w-5.5" />}
                  </motion.div>
                </AnimatePresence>
              </div>
              <span className="font-medium hidden md:block">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </motion.button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-[#0f172a] p-4 md:p-8">
          <div className="max-w-5xl mx-auto h-full overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  mass: 1,
                  duration: 0.3
                }}
                className="h-full"
              >
                {renderActiveTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}


export default App;
