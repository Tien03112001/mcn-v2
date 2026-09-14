import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import logger from '@adonisjs/core/services/logger'

/**
 * Global request logger. Logs method/path/status/duration/user for
 * every request to storage/logs (via the app logger's file transport),
 * making the request flow easy to inspect during architecture demos.
 */
export default class RequestLoggerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const startedAt = process.hrtime.bigint()

    await next()

    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000

    logger.info({
      method: ctx.request.method(),
      path: ctx.request.url(),
      statusCode: ctx.response.response.statusCode,
      userId: ctx.authUser?.id ?? null,
      ip: ctx.request.ip(),
      durationMs: Math.round(durationMs),
    })
  }
}
