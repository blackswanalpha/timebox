export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function extractYouTubePlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export function isPlaylistUrl(url: string): boolean {
  return extractYouTubePlaylistId(url) !== null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export function formatYouTubeUrl(url: string): string {
  const videoId = extractYouTubeVideoId(url);
  if (videoId) {
    const playlistId = extractYouTubePlaylistId(url);
    if (playlistId) return `Playlist: ${playlistId.slice(0, 12)}...`;
    return `youtube.com/watch?v=${videoId}`;
  }
  try {
    return new URL(url).hostname + new URL(url).pathname.slice(0, 20);
  } catch {
    return url.slice(0, 40);
  }
}
