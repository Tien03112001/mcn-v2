import { isAxiosError } from 'axios'
import { ERROR_MESSAGES } from '@/lib/error-messages'

const DEFAULT_FALLBACK = 'Đã có lỗi xảy ra. Vui lòng thử lại.'

export function getErrorCode(error: unknown): string | undefined {
  if (isAxiosError<{ error?: { code?: string } }>(error)) {
    return error.response?.data?.error?.code
  }
  return undefined
}

/**
 * Maps a backend `{ error: { code } }` response to a Vietnamese message.
 * `overrides` lets a screen replace the shared message for specific codes;
 * unmapped codes and non-API errors (network failure, etc) use `fallback`.
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_FALLBACK,
  overrides?: Record<string, string>
): string {
  const code = getErrorCode(error)
  if (code) {
    return overrides?.[code] ?? ERROR_MESSAGES[code] ?? fallback
  }
  return fallback
}
