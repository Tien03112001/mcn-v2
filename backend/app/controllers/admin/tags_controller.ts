import type { HttpContext } from '@adonisjs/core/http'
import string from '@adonisjs/core/helpers/string'
import Tag from '#models/tag'
import TagTransformer from '#transformers/tag_transformer'
import { createTagValidator, updateTagValidator } from '#validators/tag'

export default class TagsController {
  async index({ serialize }: HttpContext) {
    const tags = await Tag.query().orderBy('name', 'asc')
    return serialize(TagTransformer.transform(tags))
  }

  async store({ request, response, serialize }: HttpContext) {
    const { name } = await request.validateUsing(createTagValidator)
    const tag = await Tag.create({ name, slug: string.slug(name, { lower: true }) })
    return response.created(await serialize(TagTransformer.transform(tag)))
  }

  async update({ params, request, response, serialize }: HttpContext) {
    const tag = await Tag.find(params.id)
    if (!tag) {
      return response.notFound({ error: { code: 'TAG_NOT_FOUND' } })
    }

    const data = await request.validateUsing(updateTagValidator)
    tag.merge(data)
    if (data.name) {
      tag.slug = string.slug(data.name, { lower: true })
    }
    await tag.save()

    return serialize(TagTransformer.transform(tag))
  }

  async destroy({ params, response }: HttpContext) {
    const tag = await Tag.find(params.id)
    if (!tag) {
      return response.notFound({ error: { code: 'TAG_NOT_FOUND' } })
    }
    await tag.delete()
    return response.noContent()
  }
}
