import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { beforeSave } from '@adonisjs/lucid/orm'

export type UserRole = 'admin' | 'teacher' | 'student'

export default class User extends UserSchema {
  declare role: UserRole

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }

  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }
}
