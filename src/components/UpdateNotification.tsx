import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownTrayIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useUpdater } from "../useUpdater";

export default function UpdateNotification() {
  const {
    status,
    progress,
    version,
    body,
    error,
    dismissed,
    downloadAndInstall,
    dismissUpdate,
    checkForUpdates,
  } = useUpdater();

  const visible =
    !dismissed && (status === "available" || status === "downloading" || status === "error");

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
          className="fixed top-14 right-4 z-50 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/30 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                <ArrowDownTrayIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Update Available
              </h3>
            </div>
            <button
              onClick={dismissUpdate}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 pb-3">
            {version && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Version <span className="font-medium text-amber-600 dark:text-amber-400">{version}</span>
              </p>
            )}
            {body && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                {body}
              </p>
            )}
            {status === "error" && error && (
              <div className="flex items-start gap-2 mt-1">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {status === "downloading" && (
            <div className="px-4 pb-3">
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 text-right">{progress}%</p>
            </div>
          )}

          {/* Actions */}
          <div className="px-4 pb-4 flex gap-2">
            {status === "available" && (
              <>
                <button
                  onClick={downloadAndInstall}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-xl transition-colors"
                >
                  <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                  Update Now
                </button>
                <button
                  onClick={dismissUpdate}
                  className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Later
                </button>
              </>
            )}
            {status === "downloading" && (
              <p className="text-xs text-slate-500 dark:text-slate-400 w-full text-center py-1">
                Downloading update...
              </p>
            )}
            {status === "error" && (
              <button
                onClick={checkForUpdates}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl transition-colors"
              >
                <ArrowPathIcon className="h-3.5 w-3.5" />
                Retry
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
