import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORY_META: Record<string, { icon: string; gradient: string; bg: string }> = {
  Hiking:       { icon: '🥾', gradient: 'from-emerald-500 to-green-400',  bg: 'bg-emerald-500/10' },
  Photography:  { icon: '📸', gradient: 'from-violet-500 to-purple-400',  bg: 'bg-violet-500/10' },
  Cooking:      { icon: '🍳', gradient: 'from-orange-500 to-amber-400',   bg: 'bg-orange-500/10' },
  Sports:       { icon: '⚽', gradient: 'from-blue-500 to-sky-400',       bg: 'bg-blue-500/10' },
  Music:        { icon: '🎵', gradient: 'from-rose-500 to-pink-400',      bg: 'bg-rose-500/10' },
  Art:          { icon: '🎨', gradient: 'from-yellow-500 to-amber-400',   bg: 'bg-yellow-500/10' },
  Gaming:       { icon: '🎮', gradient: 'from-purple-500 to-indigo-400',  bg: 'bg-purple-500/10' },
  Yoga:         { icon: '🧘', gradient: 'from-teal-500 to-cyan-400',      bg: 'bg-teal-500/10' },
  'Book Club':  { icon: '📚', gradient: 'from-amber-600 to-yellow-400',   bg: 'bg-amber-600/10' },
  Volunteering: { icon: '🤝', gradient: 'from-cyan-500 to-blue-400',      bg: 'bg-cyan-500/10' },
};

const DEFAULT_META = { icon: '✨', gradient: 'from-primary to-primary/60', bg: 'bg-primary/10' };

export function getCategoryMeta(category: string) {
  return CATEGORY_META[category] ?? DEFAULT_META;
}
