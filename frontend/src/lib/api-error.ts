import { isAxiosError } from 'axios'

/**
 * Maps a backend `{ error: { code } }` response to a Vietnamese message via
 * the given lookup, falling back to a generic message for unmapped codes or
 * non-API errors (network failure, etc).
 */
export function getErrorMessage(error: unknown, messagesByCode: Record<string, string>, fallback: string): string {
  if (isAxiosError<{ error?: { code?: string } }>(error)) {
    const code = error.response?.data?.error?.code
    if (code && messagesByCode[code]) {
      return messagesByCode[code]
    }
  }
  return fallback
}
