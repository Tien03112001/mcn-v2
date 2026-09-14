import { BaseSeeder } from '@adonisjs/lucid/seeders'
import env from '#start/env'
import User from '#models/user'

/**
 * Creates the default admin account used to log in for the first time.
 * Safe to re-run: skips creation if the account already exists.
 */
export default class extends BaseSeeder {
  async run() {
    const email = env.get('ADMIN_EMAIL', 'admin@mcn.local')
    const existing = await User.query().where('email', email).first()
    if (existing) {
      return
    }

    await User.create({
      fullName: 'System Admin',
      email,
      password: env.get('ADMIN_PASSWORD', 'Admin@12345'),
      role: 'admin',
      isActive: true,
    })
  }
}
