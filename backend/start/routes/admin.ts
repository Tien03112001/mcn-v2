import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const UsersController = () => import('#controllers/admin/users_controller')
const SubjectsController = () => import('#controllers/admin/subjects_controller')
const TopicsController = () => import('#controllers/admin/topics_controller')
const TagsController = () => import('#controllers/admin/tags_controller')
const DashboardController = () => import('#controllers/admin/dashboard_controller')

router
  .group(() => {
    router
      .group(() => {
        router.get('dashboard', [DashboardController, 'index'])

        router.post('users', [UsersController, 'store'])
        router.get('users/:id', [UsersController, 'show'])
        router.patch('users/:id', [UsersController, 'update'])
        router.delete('users/:id', [UsersController, 'destroy'])
        router.post('users/:id/reset-password', [UsersController, 'resetPassword'])

        router.post('subjects', [SubjectsController, 'store'])
        router.patch('subjects/:id', [SubjectsController, 'update'])
        router.delete('subjects/:id', [SubjectsController, 'destroy'])
        router.post('subjects/:subjectId/topics', [TopicsController, 'store'])
        router.patch('topics/:id', [TopicsController, 'update'])
        router.delete('topics/:id', [TopicsController, 'destroy'])

        router.post('tags', [TagsController, 'store'])
        router.patch('tags/:id', [TagsController, 'update'])
        router.delete('tags/:id', [TagsController, 'destroy'])
      })
      .as('admin')
      .use([middleware.auth(), middleware.rbac(['admin'])])

    // Read-only reference data (subjects, topics, tags, student lookup) is
    // also needed by teachers when authoring questions/exams and building
    // exam room rosters — writes stay admin-only above.
    router
      .group(() => {
        router.get('users', [UsersController, 'index'])
        router.get('subjects', [SubjectsController, 'index'])
        router.get('subjects/:id', [SubjectsController, 'show'])
        router.get('subjects/:subjectId/topics', [TopicsController, 'index'])
        router.get('tags', [TagsController, 'index'])
      })
      .as('adminReadonly')
      .use([middleware.auth(), middleware.rbac(['admin', 'teacher'])])
  })
  .prefix('/api/v1/admin')
