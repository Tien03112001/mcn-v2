import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import UserTransformer from '#transformers/user_transformer'
import { createUserValidator, updateUserValidator, resetPasswordValidator } from '#validators/user'

export default class UsersController {
  async index({ request, serialize }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 20)
    const role = request.input('role')

    const query = User.query().orderBy('id', 'desc')
    if (role) {
      query.where('role', role)
    }

    const users = await query.paginate(page, perPage)
    return serialize(UserTransformer.paginate(users.all(), users.getMeta()))
  }

  async store({ request, response, serialize }: HttpContext) {
    const data = await request.validateUsing(createUserValidator)
    const user = await User.create(data)
    return response.created(await serialize(UserTransformer.transform(user)))
  }

  async show({ params, response, serialize }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ error: { code: 'USER_NOT_FOUND' } })
    }
    return serialize(UserTransformer.transform(user))
  }

  async update({ params, request, response, serialize }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ error: { code: 'USER_NOT_FOUND' } })
    }

    const data = await request.validateUsing(updateUserValidator, {
      meta: { userId: user.id },
    })
    user.merge(data)
    await user.save()

    return serialize(UserTransformer.transform(user))
  }

  async resetPassword({ params, request, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ error: { code: 'USER_NOT_FOUND' } })
    }

    const { password } = await request.validateUsing(resetPasswordValidator)

    user.password = password
    await user.save()

    return { message: 'Password reset successfully' }
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ error: { code: 'USER_NOT_FOUND' } })
    }

    user.isActive = false
    await user.save()

    return response.noContent()
  }
}
