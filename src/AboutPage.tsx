import React from "react";
import { motion } from "framer-motion";
import {
  CubeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { getVersion } from "@tauri-apps/api/app";
import { useUpdater } from "./useUpdater";

const AboutPage: React.FC = () => {
  const [appVersion, setAppVersion] = React.useState("...");
  const {
    status,
    progress,
    version: updateVersion,
    body,
    error,
    checkForUpdates,
    downloadAndInstall,
  } = useUpdater();

  React.useEffect(() => {
    getVersion().then(setAppVersion);
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      {/* App Identity */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="inline-flex bg-amber-600 p-4 rounded-2xl shadow-lg shadow-amber-500/20"
        >
          <CubeIcon className="h-12 w-12 text-white" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TimeBox</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Pomodoro Productivity Desktop App
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Version
          </span>
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            {appVersion}
          </span>
        </div>
      </div>

      {/* Update Section */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <ArrowPathIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h2 className="text-lg font-semibold">Software Updates</h2>
        </div>

        {/* Status Display */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
          {status === "idle" && (
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                You're up to date
              </span>
            </div>
          )}

          {status === "checking" && (
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <ArrowPathIcon className="h-5 w-5 text-amber-500" />
              </motion.div>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Checking for updates...
              </span>
            </div>
          )}

          {status === "available" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ArrowDownTrayIcon className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Update available: v{updateVersion}
                </span>
              </div>
              {body && (
                <p className="text-sm text-slate-500 dark:text-slate-400 pl-8">
                  {body}
                </p>
              )}
            </div>
          )}

          {status === "downloading" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "linear",
                  }}
                >
                  <ArrowDownTrayIcon className="h-5 w-5 text-amber-500" />
                </motion.div>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Downloading update... {progress}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-amber-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {status === "installing" && (
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <ArrowPathIcon className="h-5 w-5 text-green-500" />
              </motion.div>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Installing update... Restarting soon
              </span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-3">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">
                {error}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={checkForUpdates}
            disabled={status === "checking" || status === "downloading" || status === "installing"}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Check for Updates
          </motion.button>

          {status === "available" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={downloadAndInstall}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Update Now
            </motion.button>
          )}

          {status === "error" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={checkForUpdates}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Retry
            </motion.button>
          )}
        </div>
      </div>

      {/* App Info */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400">
              Framework
            </span>
            <p className="font-medium">Tauri 2.0</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400">
              Frontend
            </span>
            <p className="font-medium">React 19</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400">
              Database
            </span>
            <p className="font-medium">SQLite</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 dark:text-slate-400">License</span>
            <p className="font-medium">MIT</p>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
        Built with Tauri, React, and Rust
      </p>
    </div>
  );
};

export default AboutPage;
