import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { submitThrottle } from '#start/limiter'

const ExamsController = () => import('#controllers/student/exams_controller')
const AttemptsController = () => import('#controllers/student/attempts_controller')

router
  .group(() => {
    router.get('exams', [ExamsController, 'index'])
    router.get('exams/:examClassId', [ExamsController, 'show'])

    router.post('exams/:examClassId/attempts', [AttemptsController, 'start'])
    router.get('attempts', [AttemptsController, 'history'])
    router.get('attempts/:attemptId', [AttemptsController, 'show'])
    router.put('attempts/:attemptId/answers/:questionId', [AttemptsController, 'saveAnswer'])
    router.post('attempts/:attemptId/violations', [AttemptsController, 'reportViolation'])
    router.post('attempts/:attemptId/submit', [AttemptsController, 'submit']).use(submitThrottle)
    router.get('attempts/:attemptId/result', [AttemptsController, 'result'])
  })
  .prefix('/api/v1/student')
  .as('student')
  .use([middleware.auth(), middleware.rbac(['student'])])
