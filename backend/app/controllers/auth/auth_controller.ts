import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import env from '#start/env'
import User from '#models/user'
import AuthService from '#services/auth_service'
import UserTransformer from '#transformers/user_transformer'
import { loginValidator } from '#validators/user'

const REFRESH_COOKIE_NAME = 'refresh_token'

export default class AuthController {
  async login({ request, response, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.query().where('email', email).first()
    const isValid = user ? await hash.verify(user.password, password) : false

    if (!user || !isValid || !user.isActive) {
      return response.unauthorized({ error: { code: 'INVALID_CREDENTIALS' } })
    }

    const tokens = await AuthService.issueTokensForLogin(user)
    this.#setRefreshCookie(response, tokens.refreshToken)

    return serialize({
      accessToken: tokens.accessToken,
      user: UserTransformer.transform(user),
    })
  }

  async refresh({ request, response, serialize }: HttpContext) {
    const rawRefreshToken = request.cookie(REFRESH_COOKIE_NAME) ?? request.input('refreshToken')

    if (!rawRefreshToken) {
      return response.unauthorized({ error: { code: 'MISSING_REFRESH_TOKEN' } })
    }

    try {
      const tokens = await AuthService.rotateRefreshToken(rawRefreshToken)
      this.#setRefreshCookie(response, tokens.refreshToken)
      return serialize({ accessToken: tokens.accessToken })
    } catch {
      response.clearCookie(REFRESH_COOKIE_NAME)
      return response.unauthorized({ error: { code: 'INVALID_REFRESH_TOKEN' } })
    }
  }

  async logout({ request, response }: HttpContext) {
    const rawRefreshToken = request.cookie(REFRESH_COOKIE_NAME) ?? request.input('refreshToken')

    if (rawRefreshToken) {
      await AuthService.revokeRefreshToken(rawRefreshToken)
    }

    response.clearCookie(REFRESH_COOKIE_NAME)
    return { message: 'Logged out successfully' }
  }

  async me({ authUser, serialize }: HttpContext) {
    return serialize(UserTransformer.transform(authUser))
  }

  #setRefreshCookie(response: HttpContext['response'], token: string) {
    response.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: env.get('COOKIE_SAME_SITE'),
      secure: env.get('NODE_ENV') === 'production',
      maxAge: env.get('JWT_REFRESH_EXPIRES_IN_DAYS') * 24 * 60 * 60,
      path: '/',
    })
  }
}
