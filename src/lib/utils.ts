
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a sanitized key from a prompt string, suitable for use in client-side caching.
 * This logic should mirror the `createPromptKey` function in the AI flow.
 * @param prompt The original prompt string.
 * @returns A sanitized string.
 */
export function sanitizePromptForClientCacheKey(prompt: string): string {
  if (!prompt) return 'no-prompt';
  return prompt
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric (excluding hyphens)
    .slice(0, 150); // Truncate to a reasonable length
}
