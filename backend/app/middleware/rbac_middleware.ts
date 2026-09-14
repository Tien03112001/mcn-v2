import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { UserRole } from '#models/user'

/**
 * Restricts a route to a set of roles. Must run after AuthMiddleware
 * since it relies on ctx.authUser being populated.
 *
 * Usage: middleware.rbac(['admin', 'teacher'])
 */
export default class RbacMiddleware {
  async handle(ctx: HttpContext, next: NextFn, allowedRoles: UserRole[]) {
    if (!ctx.authUser) {
      return ctx.response.unauthorized({ error: { code: 'UNAUTHENTICATED' } })
    }

    if (!allowedRoles.includes(ctx.authUser.role)) {
      return ctx.response.forbidden({ error: { code: 'FORBIDDEN' } })
    }

    return next()
  }
}
