export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let timeString = `${secs}s`;
  if (minutes > 0) timeString = `${minutes}m ${timeString}`;
  if (hours > 0) timeString = `${hours}h ${timeString}`;

  return timeString;
}

export function generateRandomColor(): string {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  const a = Math.random().toFixed(1);
  
  return `rgba(${r},${g},${b},${a})`;
}