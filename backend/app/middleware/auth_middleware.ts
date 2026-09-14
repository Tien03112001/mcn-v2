import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import jwt from 'jsonwebtoken'
import AuthService from '#services/auth_service'
import User from '#models/user'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    authUser: User
  }
}

/**
 * Verifies the JWT access token from the Authorization header and
 * attaches the loaded user to ctx.authUser. Responds 401 with a
 * TOKEN_EXPIRED code when the token is expired so the frontend knows
 * to call /auth/refresh instead of forcing a full logout.
 */
export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const header = ctx.request.header('authorization')
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null

    if (!token) {
      return ctx.response.unauthorized({ error: { code: 'UNAUTHENTICATED' } })
    }

    let payload
    try {
      payload = AuthService.verifyAccessToken(token)
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return ctx.response.unauthorized({ error: { code: 'TOKEN_EXPIRED' } })
      }
      return ctx.response.unauthorized({ error: { code: 'INVALID_TOKEN' } })
    }

    const user = await User.find(payload.sub)
    if (!user || !user.isActive) {
      return ctx.response.unauthorized({ error: { code: 'UNAUTHENTICATED' } })
    }

    ctx.authUser = user

    return next()
  }
}
