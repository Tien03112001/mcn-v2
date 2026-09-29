import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const DocumentsController = () => import('#controllers/shared/documents_controller')

router
  .group(() => {
    router.get('documents', [DocumentsController, 'index'])
    router.get('documents/:id/download', [DocumentsController, 'download'])
  })
  .prefix('/api/v1')
  .use([middleware.auth(), middleware.rbac(['admin', 'teacher', 'student'])])

router
  .group(() => {
    router.post('documents', [DocumentsController, 'store'])
    router.delete('documents/:id', [DocumentsController, 'destroy'])
  })
  .prefix('/api/v1')
  .use([middleware.auth(), middleware.rbac(['admin', 'teacher'])])
