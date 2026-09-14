import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, targets } from '@adonisjs/core/logger'

const loggerConfig = defineConfig({
  /**
   * Default logger name used by ctx.logger and app logger calls.
   */
  default: 'app',

  loggers: {
    app: {
      /**
       * Toggle this logger on/off.
       */
      enabled: true,

      /**
       * Logger name shown in log records.
       */
      name: env.get('APP_NAME'),

      /**
       * Minimum level to output (trace, debug, info, warn, error, fatal).
       */
      level: env.get('LOG_LEVEL'),

      /**
       * Logs go to both stdout (pretty-printed in dev, for interactive
       * visibility) and a request log file (for architecture demos —
       * tail -f storage/logs/requests/app.log).
       */
      transport: {
        targets: targets()
          .pushIf(!app.inProduction, targets.pretty())
          .pushIf(app.inProduction, targets.file({ destination: 1 }))
          .push(targets.file({ destination: app.makePath('storage/logs/requests/app.log') }))
          .toArray(),
      },
    },
  },
})

export default loggerConfig

/**
 * Inferring types for the list of loggers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
