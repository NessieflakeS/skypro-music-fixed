export const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (seconds: number): string => {
  return formatTime(seconds);
};