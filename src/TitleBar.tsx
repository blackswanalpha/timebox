import { getCurrentWindow } from '@tauri-apps/api/window';
import { MinusIcon, XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { motion, AnimatePresence } from 'framer-motion';

export default function TitleBar() {
    const [showDialog, setShowDialog] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCloseClick = async () => {
        const appWindow = getCurrentWindow();
        try {
            const hasSession = await invoke<boolean>('has_active_session');
            if (hasSession) {
                setShowDialog(true);
            } else {
                await appWindow.close();
            }
        } catch (err) {
            console.error('Error:', err);
            await appWindow.close();
        }
    };

    const handleSaveAndClose = async () => {
        setIsProcessing(true);
        const appWindow = getCurrentWindow();
        try {
            await invoke('save_active_session');
            await appWindow.close();
        } catch (err) {
            console.error('Save error:', err);
            setIsProcessing(false);
        }
    };

    const handleCloseWithoutSaving = async () => {
        setIsProcessing(true);
        const appWindow = getCurrentWindow();
        try {
            await appWindow.close();
        } catch (err) {
            console.error('Close error:', err);
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div
                data-tauri-drag-region
                className="drag-region fixed top-0 left-0 right-0 h-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-between items-center z-[1000] select-none border-b border-slate-200 dark:border-slate-800"
            >
                <div className="pl-3 text-xs font-semibold text-slate-500 dark:text-slate-400 pointer-events-none">
                    TimeBox
                </div>
                <div className="no-drag-region flex h-full">
                    <button
                        className="flex justify-center items-center w-10 h-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => getCurrentWindow().minimize()}
                        title="Minimize"
                        type="button"
                    >
                        <MinusIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                        className="flex justify-center items-center w-10 h-full text-slate-500 hover:bg-red-500 hover:text-white transition-colors"
                        onClick={handleCloseClick}
                        title="Close"
                        type="button"
                    >
                        <XMarkIcon className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[10000] p-4"
                        onClick={() => !isProcessing && setShowDialog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 transform transition-all"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                                    className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg"
                                >
                                    <ExclamationCircleIcon className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                                </motion.div>
                                <h3 className="text-lg font-bold">Active Session</h3>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                                You have an active Pomodoro session running. Would you like to save your progress before closing?
                            </p>
                            <div className="flex gap-2 justify-end">
                                <button
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    onClick={() => setShowDialog(false)}
                                    disabled={isProcessing}
                                    type="button"
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    onClick={handleCloseWithoutSaving}
                                    disabled={isProcessing}
                                    type="button"
                                >
                                    {isProcessing ? 'Closing...' : "Don't Save"}
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-colors"
                                    onClick={handleSaveAndClose}
                                    disabled={isProcessing}
                                    type="button"
                                >
                                    {isProcessing ? 'Saving...' : 'Save & Close'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
