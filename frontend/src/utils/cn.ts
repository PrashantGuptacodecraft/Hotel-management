import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Conditionally join Tailwind classes, resolving conflicts intelligently.
 * cn('px-2', condition && 'px-4') -> 'px-4'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
