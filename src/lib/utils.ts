
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Priority colors for charts and visualizations
export const PRIORITY_COLORS = {
  high: '#ef4444', // Red
  medium: '#f59e0b', // Amber
  low: '#10b981', // Green
};

// Chart colors
export const COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#0ea5e9', // Sky
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#8b5cf6', // Purple
];

// Format milliseconds to HH:MM:SS
export const formatMilliseconds = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
};

// Format milliseconds to human readable time
export const humanizeTime = (ms: number) => {
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
