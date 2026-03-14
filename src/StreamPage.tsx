import React, { useRef, useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
const Player = ReactPlayer as any;
import {
  PlayIcon,
  PauseIcon,
  TrashIcon,
  LinkIcon,
  BookmarkIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XMarkIcon,
  PlayCircleIcon,
  ForwardIcon,
  BackwardIcon,
  PlusIcon,
  QueueListIcon,
  ArrowPathIcon,
  PencilIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/solid';
import { toast } from 'sonner';
import {
  streamUrlInputAtom,
  streamCurrentUrlAtom,
  streamIsPlayingAtom,
  streamVolumeAtom,
  streamMutedAtom,
  streamSavedVideosAtom,
  streamPlaylistsAtom,
  streamActivePlaylistIdAtom,
  streamPlaylistIndexAtom,
  streamShuffleAtom,
  streamRepeatAtom,
  SavedVideo,
  Playlist,
  StreamRepeatMode,
} from './atoms';
import {
  extractYouTubeVideoId,
  getYouTubeThumbnail,
  formatYouTubeUrl,
} from './streamUtils';

type ViewTab = 'videos' | 'playlists';

const StreamPage: React.FC = () => {
  const [urlInput, setUrlInput] = useAtom(streamUrlInputAtom);
  const [currentUrl, setCurrentUrl] = useAtom(streamCurrentUrlAtom);
  const [isPlaying, setIsPlaying] = useAtom(streamIsPlayingAtom);
  const [volume, setVolume] = useAtom(streamVolumeAtom);
  const [muted, setMuted] = useAtom(streamMutedAtom);
  const [savedVideos, setSavedVideos] = useAtom(streamSavedVideosAtom);
  const [playlists, setPlaylists] = useAtom(streamPlaylistsAtom);
  const [activePlaylistId, setActivePlaylistId] = useAtom(streamActivePlaylistIdAtom);
  const [playlistIndex, setPlaylistIndex] = useAtom(streamPlaylistIndexAtom);
  const [shuffle, setShuffle] = useAtom(streamShuffleAtom);
  const [repeat, setRepeat] = useAtom(streamRepeatAtom);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);

  const [viewTab, setViewTab] = useState<ViewTab>('videos');
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [addToPlaylistVideoId, setAddToPlaylistVideoId] = useState<string | null>(null);
  const [showPlayerAddToPlaylist, setShowPlayerAddToPlaylist] = useState(false);
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [editPlaylistName, setEditPlaylistName] = useState('');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVolumeBubble, setShowVolumeBubble] = useState(false);

  const formatTime = (secs: number) => {
    if (!isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setProgress(time);
    playerRef.current?.seekTo(time, 'seconds');
  };

  const handleProgress = (state: any) => {
    setProgress(state.playedSeconds);
  };

  const handleDuration = (dur: number) => {
    setDuration(dur);
  };

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId) ?? null;

  // --- Playback helpers ---

  const playVideoAt = useCallback(
    (playlist: Playlist, index: number) => {
      if (index < 0 || index >= playlist.videos.length) return;
      setActivePlaylistId(playlist.id);
      setPlaylistIndex(index);
      setCurrentUrl(playlist.videos[index].url);
      setUrlInput(playlist.videos[index].url);
      setIsPlaying(true);
    },
    [setActivePlaylistId, setPlaylistIndex, setCurrentUrl, setUrlInput, setIsPlaying],
  );

  const getNextIndex = useCallback(
    (playlist: Playlist, current: number): number | null => {
      if (repeat === 'one') return current;
      if (shuffle) {
        if (playlist.videos.length <= 1) return current;
        let next = current;
        while (next === current) {
          next = Math.floor(Math.random() * playlist.videos.length);
        }
        return next;
      }
      const next = current + 1;
      if (next >= playlist.videos.length) {
        return repeat === 'all' ? 0 : null;
      }
      return next;
    },
    [repeat, shuffle],
  );

  const handleVideoEnd = useCallback(() => {
    if (!activePlaylist) {
      setIsPlaying(false);
      return;
    }
    const nextIdx = getNextIndex(activePlaylist, playlistIndex);
    if (nextIdx !== null) {
      playVideoAt(activePlaylist, nextIdx);
    } else {
      setIsPlaying(false);
    }
  }, [activePlaylist, playlistIndex, getNextIndex, playVideoAt, setIsPlaying]);

  const handleNext = () => {
    if (!activePlaylist) return;
    const nextIdx = getNextIndex(activePlaylist, playlistIndex);
    if (nextIdx !== null) playVideoAt(activePlaylist, nextIdx);
  };

  const handlePrev = () => {
    if (!activePlaylist) return;
    const prevIdx = shuffle
      ? Math.floor(Math.random() * activePlaylist.videos.length)
      : playlistIndex - 1 < 0
        ? repeat === 'all'
          ? activePlaylist.videos.length - 1
          : 0
        : playlistIndex - 1;
    playVideoAt(activePlaylist, prevIdx);
  };

  const cycleRepeat = () => {
    const modes: StreamRepeatMode[] = ['none', 'all', 'one'];
    const idx = modes.indexOf(repeat);
    setRepeat(modes[(idx + 1) % modes.length]);
  };

  // --- Single video handlers ---

  const handlePlay = () => {
    const url = urlInput.trim();
    if (!url) {
      toast.error('Please enter a YouTube URL');
      return;
    }
    if (ReactPlayer.canPlay && !ReactPlayer.canPlay(url)) {
      toast.error('Invalid YouTube URL');
      return;
    }
    setActivePlaylistId(null);
    setCurrentUrl(url);
    setIsPlaying(true);
  };

  const handleSave = () => {
    const url = currentUrl || urlInput.trim();
    if (!url) {
      toast.error('No video to save');
      return;
    }
    if (savedVideos.some((v) => v.url === url)) {
      toast.info('Video already saved');
      return;
    }
    const videoId = extractYouTubeVideoId(url);
    const newVideo: SavedVideo = {
      id: crypto.randomUUID(),
      url,
      title: formatYouTubeUrl(url),
      thumbnailUrl: videoId ? getYouTubeThumbnail(videoId) : '',
      savedAt: new Date().toISOString(),
    };
    setSavedVideos((prev) => [newVideo, ...prev]);
    toast.success('Video saved');
  };

  const handleDelete = (id: string) => {
    setSavedVideos((prev) => prev.filter((v) => v.id !== id));
    toast.success('Video removed');
  };

  const handlePlaySaved = (url: string) => {
    setActivePlaylistId(null);
    setCurrentUrl(url);
    setUrlInput(url);
    setIsPlaying(true);
  };

  const handleClose = () => {
    setCurrentUrl('');
    setIsPlaying(false);
    setActivePlaylistId(null);
  };

  // --- Playlist CRUD ---

  const handleCreatePlaylist = () => {
    const name = newPlaylistName.trim();
    if (!name) {
      toast.error('Enter a playlist name');
      return;
    }
    const playlist: Playlist = {
      id: crypto.randomUUID(),
      name,
      videos: [],
      createdAt: new Date().toISOString(),
    };
    setPlaylists((prev) => [playlist, ...prev]);
    setNewPlaylistName('');
    setShowNewPlaylist(false);
    toast.success(`Playlist "${name}" created`);
  };

  const handleDeletePlaylist = (id: string) => {
    if (activePlaylistId === id) {
      setActivePlaylistId(null);
    }
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    toast.success('Playlist deleted');
  };

  const handleRenamePlaylist = (id: string) => {
    const name = editPlaylistName.trim();
    if (!name) return;
    setPlaylists((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p)),
    );
    setEditingPlaylistId(null);
    setEditPlaylistName('');
  };

  const handleAddToPlaylist = (playlistId: string, video: SavedVideo) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id !== playlistId) return p;
        if (p.videos.some((v) => v.url === video.url)) {
          toast.info('Already in this playlist');
          return p;
        }
        return { ...p, videos: [...p.videos, video] };
      }),
    );
    setAddToPlaylistVideoId(null);
    toast.success('Added to playlist');
  };

  const handleRemoveFromPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, videos: p.videos.filter((v) => v.id !== videoId) }
          : p,
      ),
    );
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.videos.length === 0) {
      toast.error('Playlist is empty');
      return;
    }
    const startIdx = shuffle ? Math.floor(Math.random() * playlist.videos.length) : 0;
    playVideoAt(playlist, startIdx);
    toast.success(`Playing "${playlist.name}"`);
  };

  // --- Repeat label ---
  const repeatLabel = repeat === 'none' ? 'Repeat' : repeat === 'all' ? 'Repeat All' : 'Repeat One';

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-3xl mx-auto py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-widest border border-rose-100 dark:border-rose-800/50 block w-fit mx-auto"
        >
          Stream
        </motion.span>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-3xl font-bold tracking-tight text-slate-800 dark:text-white"
        >
          {activePlaylist
            ? `Playing: ${activePlaylist.name}`
            : currentUrl
              ? 'Now Playing'
              : 'YouTube Stream'}
        </motion.h2>
        {activePlaylist && (
          <p className="text-sm text-slate-400 mt-1">
            Track {playlistIndex + 1} of {activePlaylist.videos.length}
          </p>
        )}
      </motion.div>

      {/* URL Input */}
      <div className="w-full max-w-md mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Paste YouTube URL..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePlay();
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlay}
            className="px-5 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/30"
          >
            <PlayIcon className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-700 transition-all"
            title="Save video"
          >
            <BookmarkIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Video Player */}
      <AnimatePresence>
        {currentUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-full mb-8"
          >
            <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
              <Player
                ref={playerRef}
                url={currentUrl}
                playing={isPlaying}
                volume={volume}
                muted={muted}
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={handleVideoEnd}
                onError={() => toast.error('Failed to load video')}
                onProgress={handleProgress}
                onDuration={handleDuration}
                config={{ youtube: { playerVars: { modestbranding: 1 }, embedOptions: { host: 'https://www.youtube-nocookie.com' } } } as any}
              />
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2 mt-3 px-1">
              <span className="text-[10px] font-mono text-slate-400 w-8 text-right tabular-nums">
                {formatTime(progress)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={progress}
                onChange={handleSeek}
                className="flex-1 h-1 accent-rose-600 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-400 w-8 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-center gap-1 mt-2 px-1">
              {activePlaylist && (
                <button
                  onClick={handlePrev}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  title="Previous"
                >
                  <BackwardIcon className="h-5 w-5" />
                </button>
              )}

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
              >
                {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
              </button>

              {activePlaylist && (
                <button
                  onClick={handleNext}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  title="Next"
                >
                  <ForwardIcon className="h-5 w-5" />
                </button>
              )}

              <span className="mx-1 w-px h-5 bg-slate-200 dark:bg-slate-700" />

              <button
                onClick={() => setShuffle(!shuffle)}
                className={`p-2 transition-colors ${
                  shuffle
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
                }`}
                title={shuffle ? 'Shuffle On' : 'Shuffle Off'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.24 3.34l3.42 3.42-3.42 3.42V7.84h-1.62c-1.2 0-2.28.66-2.84 1.72l-.72 1.38-.72-1.38C10.78 8.5 9.7 7.84 8.5 7.84H3v-2h5.5c2.02 0 3.82 1.12 4.74 2.76l.01.01.01-.01C14.18 7.46 15.32 6.84 16.62 5.84h.62V3.34zm0 17.32l3.42-3.42-3.42-3.42v2.34h-1.62c-1.3 0-2.44-.62-3.36-1.76l-.01-.01-.01.01c-.92 1.64-2.72 2.76-4.74 2.76H3v-2h5.5c1.2 0 2.28-.66 2.84-1.72l.72-1.38.72 1.38c.56 1.06 1.64 1.72 2.84 1.72h1.62v2.34z"/>
                </svg>
              </button>

              <button
                onClick={cycleRepeat}
                className={`p-2 relative transition-colors ${
                  repeat !== 'none'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
                }`}
                title={repeatLabel}
              >
                <ArrowPathIcon className="h-4 w-4" />
                {repeat === 'one' && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    1
                  </span>
                )}
              </button>

              <span className="mx-1 w-px h-5 bg-slate-200 dark:bg-slate-700" />

              <button
                onClick={handleSave}
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="Save video"
              >
                <BookmarkIcon className="h-4 w-4" />
              </button>

              {/* Add to Playlist */}
              <div className="relative">
                <button
                  onClick={() => setShowPlayerAddToPlaylist(!showPlayerAddToPlaylist)}
                  className={`p-2 transition-colors ${
                    showPlayerAddToPlaylist
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
                  }`}
                  title="Add to playlist"
                >
                  <QueueListIcon className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {showPlayerAddToPlaylist && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -5 }}
                      className="absolute right-0 bottom-10 z-30 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2"
                    >
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5">
                        Add to playlist
                      </p>
                      {playlists.length === 0 ? (
                        <p className="text-xs text-slate-400 p-3 text-center">
                          No playlists yet — create one first
                        </p>
                      ) : (
                        playlists.map((pl) => (
                          <button
                            key={pl.id}
                            onClick={() => {
                              const url = currentUrl;
                              if (!url) return;
                              const videoId = extractYouTubeVideoId(url);
                              const video: SavedVideo = {
                                id: crypto.randomUUID(),
                                url,
                                title: formatYouTubeUrl(url),
                                thumbnailUrl: videoId ? getYouTubeThumbnail(videoId) : '',
                                savedAt: new Date().toISOString(),
                              };
                              handleAddToPlaylist(pl.id, video);
                              setShowPlayerAddToPlaylist(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-all"
                          >
                            {pl.name}
                            <span className="text-xs text-slate-400 ml-1">({pl.videos.length})</span>
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Volume bubble */}
              <div className="relative">
                <button
                  onClick={() => setShowVolumeBubble(!showVolumeBubble)}
                  className={`p-2 transition-colors ${
                    showVolumeBubble
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
                  }`}
                  title={muted ? 'Muted' : `Volume ${Math.round(volume * 100)}%`}
                >
                  {muted || volume === 0 ? <SpeakerXMarkIcon className="h-4 w-4" /> : <SpeakerWaveIcon className="h-4 w-4" />}
                </button>
                <AnimatePresence>
                  {showVolumeBubble && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 5 }}
                      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl px-3 py-4 flex flex-col items-center gap-3"
                    >
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        {Math.round(volume * 100)}%
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="h-24 accent-rose-600 cursor-pointer"
                        style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                      />
                      <button
                        onClick={() => setMuted(!muted)}
                        className={`p-1 rounded-lg transition-colors ${
                          muted ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 hover:text-rose-600'
                        }`}
                        title={muted ? 'Unmute' : 'Mute'}
                      >
                        {muted ? <SpeakerXMarkIcon className="h-4 w-4" /> : <SpeakerWaveIcon className="h-4 w-4" />}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Close player"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Active Playlist Queue */}
            {activePlaylist && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-4"
              >
                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                  Queue — {activePlaylist.name}
                </h4>
                <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                  {activePlaylist.videos.map((video, idx) => (
                    <button
                      key={video.id}
                      onClick={() => playVideoAt(activePlaylist, idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                        idx === playlistIndex
                          ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-5 text-xs font-mono text-slate-400">{idx + 1}</span>
                      {idx === playlistIndex && isPlaying && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                      )}
                      <span className="text-sm truncate flex-1">{video.title}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Switcher: Saved Videos | Playlists */}
      <div className="w-full max-w-3xl flex gap-2 mb-4">
        {(['videos', 'playlists'] as ViewTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setViewTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
              viewTab === tab
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700'
            }`}
          >
            {tab === 'videos' ? 'Saved Videos' : 'Playlists'}
          </button>
        ))}
      </div>

      {/* Saved Videos Tab */}
      {viewTab === 'videos' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/50 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 rounded-full bg-rose-500"
              />
              Saved Videos
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {savedVideos.length} videos
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
            <AnimatePresence mode="popLayout">
              {savedVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 hover:border-rose-500/30 transition-all group"
                >
                  <div
                    className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                    onClick={() => handlePlaySaved(video.url)}
                  >
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt=""
                        className="w-16 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                        <PlayCircleIcon className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm text-slate-900 dark:text-white truncate">
                        {video.title}
                      </span>
                      <span className="text-xs text-slate-400 truncate">
                        {new Date(video.savedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Add to playlist */}
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setAddToPlaylistVideoId(
                            addToPlaylistVideoId === video.id ? null : video.id,
                          )
                        }
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                        title="Add to playlist"
                      >
                        <QueueListIcon className="w-4 h-4" />
                      </motion.button>
                      {/* Playlist dropdown */}
                      <AnimatePresence>
                        {addToPlaylistVideoId === video.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -5 }}
                            className="absolute right-0 top-10 z-20 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2"
                          >
                            {playlists.length === 0 ? (
                              <p className="text-xs text-slate-400 p-2 text-center">No playlists yet</p>
                            ) : (
                              playlists.map((pl) => (
                                <button
                                  key={pl.id}
                                  onClick={() => handleAddToPlaylist(pl.id, video)}
                                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-all"
                                >
                                  {pl.name}
                                  <span className="text-xs text-slate-400 ml-1">
                                    ({pl.videos.length})
                                  </span>
                                </button>
                              ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handlePlaySaved(video.url)}
                      className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-200 dark:hover:bg-rose-900/40 transition-all opacity-0 group-hover:opacity-100"
                      title="Play"
                    >
                      <PlayIcon className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(video.id)}
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {savedVideos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <PlayCircleIcon className="w-12 h-12 mb-3 opacity-30" />
              <p className="italic">No saved videos yet</p>
              <p className="text-sm mt-1">Paste a YouTube URL and save it to your collection!</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Playlists Tab */}
      {viewTab === 'playlists' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/50 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 rounded-full bg-rose-500"
              />
              Playlists
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewPlaylist(!showNewPlaylist)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20"
            >
              <PlusIcon className="w-4 h-4" />
              New Playlist
            </motion.button>
          </div>

          {/* New Playlist Form */}
          <AnimatePresence>
            {showNewPlaylist && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Playlist name..."
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreatePlaylist();
                      if (e.key === 'Escape') setShowNewPlaylist(false);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    autoFocus
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreatePlaylist}
                    className="px-5 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all"
                  >
                    Create
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Playlist List */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {playlists.map((playlist, index) => (
                <motion.div
                  key={playlist.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 hover:border-rose-500/30 transition-all overflow-hidden"
                >
                  {/* Playlist Header */}
                  <div className="flex items-center justify-between p-4 group">
                    <div
                      className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                      onClick={() =>
                        setExpandedPlaylistId(
                          expandedPlaylistId === playlist.id ? null : playlist.id,
                        )
                      }
                    >
                      <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                        <QueueListIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        {editingPlaylistId === playlist.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editPlaylistName}
                              onChange={(e) => setEditPlaylistName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenamePlaylist(playlist.id);
                                if (e.key === 'Escape') setEditingPlaylistId(null);
                              }}
                              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 text-sm text-slate-900 dark:text-white focus:outline-none"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenamePlaylist(playlist.id);
                              }}
                              className="text-rose-600"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="font-medium text-sm text-slate-900 dark:text-white truncate">
                            {playlist.name}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {playlist.videos.length} video{playlist.videos.length !== 1 ? 's' : ''} ·{' '}
                          {new Date(playlist.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePlayPlaylist(playlist)}
                        className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-200 dark:hover:bg-rose-900/40 transition-all"
                        title="Play playlist"
                      >
                        <PlayIcon className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setEditingPlaylistId(playlist.id);
                          setEditPlaylistName(playlist.name);
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                        title="Rename"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setExpandedPlaylistId(
                            expandedPlaylistId === playlist.id ? null : playlist.id,
                          )
                        }
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center"
                        title="Expand"
                      >
                        {expandedPlaylistId === playlist.id ? (
                          <ChevronUpIcon className="w-4 h-4" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4" />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeletePlaylist(playlist.id)}
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                        title="Delete playlist"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Expanded Playlist Videos */}
                  <AnimatePresence>
                    {expandedPlaylistId === playlist.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-slate-100 dark:border-slate-800/50 overflow-hidden"
                      >
                        <div className="p-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                          {playlist.videos.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4 italic">
                              No videos — add from Saved Videos tab
                            </p>
                          ) : (
                            playlist.videos.map((video, vidIdx) => (
                              <div
                                key={video.id}
                                className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all group/vid"
                              >
                                <div
                                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                                  onClick={() => playVideoAt(playlist, vidIdx)}
                                >
                                  <span className="w-5 text-xs font-mono text-slate-400">
                                    {vidIdx + 1}
                                  </span>
                                  {video.thumbnailUrl ? (
                                    <img
                                      src={video.thumbnailUrl}
                                      alt=""
                                      className="w-12 h-8 rounded object-cover flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-12 h-8 rounded bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                                      <PlayCircleIcon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                    </div>
                                  )}
                                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                                    {video.title}
                                  </span>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    handleRemoveFromPlaylist(playlist.id, video.id)
                                  }
                                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center opacity-0 group-hover/vid:opacity-100 flex-shrink-0"
                                  title="Remove from playlist"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </motion.button>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {playlists.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <QueueListIcon className="w-12 h-12 mb-3 opacity-30" />
              <p className="italic">No playlists yet</p>
              <p className="text-sm mt-1">Create a playlist and add your saved videos!</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default StreamPage;
