import React from 'react';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XMarkIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/solid';
import {
  activeTabAtom,
  streamCurrentUrlAtom,
  streamIsPlayingAtom,
  streamVolumeAtom,
  streamMutedAtom,
  streamPlaylistsAtom,
  streamActivePlaylistIdAtom,
  streamPlaylistIndexAtom,
  streamShuffleAtom,
  streamRepeatAtom,
} from './atoms';
import { extractYouTubeVideoId, getYouTubeThumbnail, formatYouTubeUrl } from './streamUtils';

const MiniStreamPlayer: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useAtom(streamCurrentUrlAtom);
  const [isPlaying, setIsPlaying] = useAtom(streamIsPlayingAtom);
  const [volume, setVolume] = useAtom(streamVolumeAtom);
  const [muted, setMuted] = useAtom(streamMutedAtom);
  const [, setActiveTab] = useAtom(activeTabAtom);
  const [playlists] = useAtom(streamPlaylistsAtom);
  const [activePlaylistId, setActivePlaylistId] = useAtom(streamActivePlaylistIdAtom);
  const [playlistIndex, setPlaylistIndex] = useAtom(streamPlaylistIndexAtom);
  const [shuffle] = useAtom(streamShuffleAtom);
  const [repeat] = useAtom(streamRepeatAtom);

  if (!currentUrl) return null;

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId) ?? null;
  const videoId = extractYouTubeVideoId(currentUrl);
  const thumbnail = videoId ? getYouTubeThumbnail(videoId) : null;
  const title = formatYouTubeUrl(currentUrl);

  const handleNext = () => {
    if (!activePlaylist) return;
    let nextIdx: number | null;
    if (repeat === 'one') {
      nextIdx = playlistIndex;
    } else if (shuffle) {
      if (activePlaylist.videos.length <= 1) return;
      nextIdx = playlistIndex;
      while (nextIdx === playlistIndex) {
        nextIdx = Math.floor(Math.random() * activePlaylist.videos.length);
      }
    } else {
      nextIdx = playlistIndex + 1;
      if (nextIdx >= activePlaylist.videos.length) {
        nextIdx = repeat === 'all' ? 0 : null;
      }
    }
    if (nextIdx !== null && nextIdx < activePlaylist.videos.length) {
      setPlaylistIndex(nextIdx);
      setCurrentUrl(activePlaylist.videos[nextIdx].url);
      setIsPlaying(true);
    }
  };

  const handleClose = () => {
    setCurrentUrl('');
    setIsPlaying(false);
    setActivePlaylistId(null);
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="absolute bottom-4 left-4 right-4 z-20"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-black/30 p-3 flex items-center gap-3">
        {/* Thumbnail / icon */}
        <button
          onClick={() => setActiveTab('stream')}
          className="flex-shrink-0"
          title="Go to Stream"
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt=""
              className="w-12 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <PlayCircleIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
          )}
        </button>

        {/* Title */}
        <button
          onClick={() => setActiveTab('stream')}
          className="flex-1 min-w-0 text-left"
          title="Go to Stream"
        >
          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
            {title}
          </p>
          {activePlaylist && (
            <p className="text-xs text-slate-400 truncate">
              {activePlaylist.name} · {playlistIndex + 1}/{activePlaylist.videos.length}
            </p>
          )}
        </button>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition-all shadow-md shadow-rose-500/20"
          >
            {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
          </motion.button>

          {activePlaylist && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 flex items-center justify-center hover:text-rose-600 transition-all"
              title="Next"
            >
              <ForwardIcon className="h-4 w-4" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setMuted(!muted)}
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 flex items-center justify-center hover:text-rose-600 transition-all"
          >
            {muted ? <SpeakerXMarkIcon className="h-4 w-4" /> : <SpeakerWaveIcon className="h-4 w-4" />}
          </motion.button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1.5 accent-rose-600 cursor-pointer"
          />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 flex items-center justify-center hover:text-red-500 transition-all"
            title="Stop stream"
          >
            <XMarkIcon className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default MiniStreamPlayer;
