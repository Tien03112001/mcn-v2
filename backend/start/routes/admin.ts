import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const UsersController = () => import('#controllers/admin/users_controller')
const ClassesController = () => import('#controllers/admin/classes_controller')
const SubjectsController = () => import('#controllers/admin/subjects_controller')
const TopicsController = () => import('#controllers/admin/topics_controller')
const TagsController = () => import('#controllers/admin/tags_controller')
const DashboardController = () => import('#controllers/admin/dashboard_controller')

router
  .group(() => {
    router
      .group(() => {
        router.get('dashboard', [DashboardController, 'index'])

        router.get('users', [UsersController, 'index'])
        router.post('users', [UsersController, 'store'])
        router.get('users/:id', [UsersController, 'show'])
        router.patch('users/:id', [UsersController, 'update'])
        router.delete('users/:id', [UsersController, 'destroy'])
        router.post('users/:id/reset-password', [UsersController, 'resetPassword'])

        router.get('classes', [ClassesController, 'index'])
        router.post('classes', [ClassesController, 'store'])
        router.get('classes/:id', [ClassesController, 'show'])
        router.patch('classes/:id', [ClassesController, 'update'])
        router.delete('classes/:id', [ClassesController, 'destroy'])
        router.get('classes/:id/students', [ClassesController, 'students'])
        router.post('classes/:id/students', [ClassesController, 'addStudent'])
        router.post('classes/:id/students/import', [ClassesController, 'importStudents'])
        router.delete('classes/:id/students/:studentId', [ClassesController, 'removeStudent'])
        router.post('classes/:id/teachers', [ClassesController, 'assignTeacher'])
        router.delete('classes/:id/teachers/:teacherId', [ClassesController, 'removeTeacher'])

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

    // Read-only reference data (subjects, topics, tags) is also needed by
    // teachers when authoring questions/exams — writes stay admin-only above.
    router
      .group(() => {
        router.get('subjects', [SubjectsController, 'index'])
        router.get('subjects/:id', [SubjectsController, 'show'])
        router.get('subjects/:subjectId/topics', [TopicsController, 'index'])
        router.get('tags', [TagsController, 'index'])
      })
      .as('adminReadonly')
      .use([middleware.auth(), middleware.rbac(['admin', 'teacher'])])
  })
  .prefix('/api/v1/admin')
