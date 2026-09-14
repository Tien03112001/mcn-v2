import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const FilesController = () => import('#controllers/shared/files_controller')

router
  .group(() => {
    router.get(':id', [FilesController, 'show'])
  })
  .prefix('/api/v1/files')
  .as('files')
  .use([middleware.auth()])
