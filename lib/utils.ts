import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class values and merges Tailwind CSS classes
 * @param classes - Array of class values to combine
 * @returns Merged class string
 */
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes));
}
