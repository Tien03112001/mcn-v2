import { BaseSeeder } from '@adonisjs/lucid/seeders'
import string from '@adonisjs/core/helpers/string'
import Subject from '#models/subject'
import Tag from '#models/tag'

const SUBJECTS = [
  { code: 'TOAN', name: 'Toán' },
  { code: 'LY', name: 'Vật lý' },
  { code: 'HOA', name: 'Hóa học' },
  { code: 'VAN', name: 'Ngữ văn' },
  { code: 'ANH', name: 'Tiếng Anh' },
]

const TAGS = ['THPT Quốc Gia', 'HSA', 'V-ACT', 'TSA']

/**
 * Seeds baseline reference data (subjects + exam tags) so the app has
 * something to browse right after setup, mirroring nganhangdethi.vn's
 * exam categories. Safe to re-run: skips rows that already exist.
 */
export default class extends BaseSeeder {
  async run() {
    for (const subject of SUBJECTS) {
      const exists = await Subject.query().where('code', subject.code).first()
      if (!exists) {
        await Subject.create(subject)
      }
    }

    for (const name of TAGS) {
      const exists = await Tag.query().where('name', name).first()
      if (!exists) {
        await Tag.create({ name, slug: string.slug(name, { lower: true }) })
      }
    }
  }
}
