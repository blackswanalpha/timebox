import { useState, useEffect, useCallback, useRef } from "react";
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "installing"
  | "error";

interface UpdaterState {
  status: UpdateStatus;
  progress: number;
  version: string | null;
  body: string | null;
  error: string | null;
}

export function useUpdater() {
  const [state, setState] = useState<UpdaterState>({
    status: "idle",
    progress: 0,
    version: null,
    body: null,
    error: null,
  });
  const [dismissed, setDismissed] = useState(false);
  const updateRef = useRef<Update | null>(null);

  const checkForUpdates = useCallback(async () => {
    setState((s) => ({ ...s, status: "checking", error: null }));
    try {
      const update = await check();
      if (update) {
        updateRef.current = update;
        setState((s) => ({
          ...s,
          status: "available",
          version: update.version,
          body: update.body ?? null,
        }));
        setDismissed(false);
      } else {
        setState((s) => ({ ...s, status: "idle" }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // No release published yet or network issue — silently ignore
      if (
        message.includes("Could not fetch") ||
        message.includes("404") ||
        message.includes("network") ||
        message.includes("Failed to fetch")
      ) {
        console.log("Update check skipped:", message);
        setState((s) => ({ ...s, status: "idle" }));
        return;
      }
      setState((s) => ({
        ...s,
        status: "error",
        error: message,
      }));
    }
  }, []);

  const downloadAndInstall = useCallback(async () => {
    const update = updateRef.current;
    if (!update) return;

    setState((s) => ({ ...s, status: "downloading", progress: 0 }));
    try {
      let contentLength = 0;
      let downloaded = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength ?? 0;
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            if (contentLength > 0) {
              setState((s) => ({
                ...s,
                progress: Math.round((downloaded / contentLength) * 100),
              }));
            }
            break;
          case "Finished":
            setState((s) => ({ ...s, status: "installing", progress: 100 }));
            break;
        }
      });

      await relaunch();
    } catch (err) {
      setState((s) => ({
        ...s,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    setDismissed(true);
  }, []);

  // Auto-check 5 seconds after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUpdates();
    }, 5000);
    return () => clearTimeout(timer);
  }, [checkForUpdates]);

  return {
    ...state,
    dismissed,
    checkForUpdates,
    downloadAndInstall,
    dismissUpdate,
  };
}
