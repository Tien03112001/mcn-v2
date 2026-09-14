import crypto, { randomUUID } from 'node:crypto'
import jwt from 'jsonwebtoken'
import redis from '@adonisjs/redis/services/main'
import env from '#start/env'
import User from '#models/user'
import RefreshToken from '#models/refresh_token'
import { DateTime } from 'luxon'

export interface AccessTokenPayload {
  sub: number
  role: User['role']
}

interface IssuedTokens {
  accessToken: string
  refreshToken: string
  refreshTokenExpiresAt: DateTime
}

const REFRESH_TOKEN_BYTES = 32

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function refreshTokenTtlSeconds(): number {
  return env.get('JWT_REFRESH_EXPIRES_IN_DAYS') * 24 * 60 * 60
}

export default class AuthService {
  static signAccessToken(user: User): string {
    const payload: AccessTokenPayload = { sub: user.id, role: user.role }
    return jwt.sign(payload, env.get('JWT_ACCESS_SECRET'), {
      expiresIn: env.get('JWT_ACCESS_EXPIRES_IN') as `${number}${'s' | 'm' | 'h' | 'd'}`,
    })
  }

  static verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.get('JWT_ACCESS_SECRET')) as unknown as AccessTokenPayload
  }

  /**
   * Issues a brand new access + refresh token pair for a fresh login,
   * starting a new rotation family.
   */
  static async issueTokensForLogin(user: User): Promise<IssuedTokens> {
    return this.#issueTokens(user, randomUUID())
  }

  /**
   * Rotates a refresh token: revokes the old one and issues a new pair
   * within the same rotation family. Throws if the token is invalid,
   * expired, or already revoked (possible reuse attack).
   */
  static async rotateRefreshToken(rawRefreshToken: string): Promise<IssuedTokens> {
    const tokenHash = hashToken(rawRefreshToken)
    const cached = await redis.get(`refresh:${tokenHash}`)

    const record = await RefreshToken.query().where('token_hash', tokenHash).first()

    if (!cached || !record || record.isRevoked) {
      if (record && !record.isRevoked) {
        // Token existed in DB but not in Redis (expired) — nothing to do.
      } else if (record?.isRevoked) {
        // Reuse of an already-rotated token: revoke the whole family defensively.
        await this.#revokeFamily(record.familyId)
      }
      throw new Error('INVALID_REFRESH_TOKEN')
    }

    if (record.expiresAt < DateTime.now()) {
      throw new Error('INVALID_REFRESH_TOKEN')
    }

    const user = await User.find(record.userId)
    if (!user || !user.isActive) {
      throw new Error('INVALID_REFRESH_TOKEN')
    }

    await this.#revokeToken(record)

    return this.#issueTokens(user, record.familyId)
  }

  static async revokeRefreshToken(rawRefreshToken: string): Promise<void> {
    const tokenHash = hashToken(rawRefreshToken)
    const record = await RefreshToken.query().where('token_hash', tokenHash).first()
    if (record) {
      await this.#revokeToken(record)
    }
  }

  static async #issueTokens(user: User, familyId: string): Promise<IssuedTokens> {
    const accessToken = this.signAccessToken(user)

    const rawRefreshToken = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex')
    const tokenHash = hashToken(rawRefreshToken)
    const expiresAt = DateTime.now().plus({ days: env.get('JWT_REFRESH_EXPIRES_IN_DAYS') })

    await RefreshToken.create({
      userId: user.id,
      tokenHash,
      familyId,
      isRevoked: false,
      expiresAt,
    })

    await redis.set(`refresh:${tokenHash}`, user.id, 'EX', refreshTokenTtlSeconds())

    return { accessToken, refreshToken: rawRefreshToken, refreshTokenExpiresAt: expiresAt }
  }

  static async #revokeToken(record: RefreshToken): Promise<void> {
    record.isRevoked = true
    await record.save()
    await redis.del(`refresh:${record.tokenHash}`)
  }

  static async #revokeFamily(familyId: string): Promise<void> {
    const tokens = await RefreshToken.query().where('family_id', familyId).where('is_revoked', false)
    for (const token of tokens) {
      await this.#revokeToken(token)
    }
  }
}
