import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const QuestionsController = () => import('#controllers/teacher/questions_controller')
const AttachmentsController = () => import('#controllers/teacher/attachments_controller')
const ExamsController = () => import('#controllers/teacher/exams_controller')
const ExamQuestionsController = () => import('#controllers/teacher/exam_questions_controller')
const ExamRoomsController = () => import('#controllers/teacher/exam_rooms_controller')
const ExamRoomStudentsController = () =>
  import('#controllers/teacher/exam_room_students_controller')
const AttemptsController = () => import('#controllers/teacher/attempts_controller')

router
  .group(() => {
    router.get('questions', [QuestionsController, 'index'])
    router.post('questions', [QuestionsController, 'store'])
    router.get('questions/:id', [QuestionsController, 'show'])
    router.patch('questions/:id', [QuestionsController, 'update'])
    router.delete('questions/:id', [QuestionsController, 'destroy'])
    router.post('questions/:questionId/attachments', [AttachmentsController, 'store'])
    router.delete('questions/:questionId/attachments/:fileId', [AttachmentsController, 'destroy'])

    router.get('exams', [ExamsController, 'index'])
    router.post('exams', [ExamsController, 'store'])
    router.get('exams/:id', [ExamsController, 'show'])
    router.patch('exams/:id', [ExamsController, 'update'])
    router.delete('exams/:id', [ExamsController, 'destroy'])
    router.post('exams/:id/publish', [ExamsController, 'publish'])

    router.get('exams/:id/questions', [ExamQuestionsController, 'index'])
    router.post('exams/:id/questions', [ExamQuestionsController, 'store'])
    router.patch('exams/:id/questions/:examQuestionId', [ExamQuestionsController, 'update'])
    router.delete('exams/:id/questions/:examQuestionId', [ExamQuestionsController, 'destroy'])

    router.get('exams/:id/rooms', [ExamRoomsController, 'index'])
    router.post('exams/:id/rooms', [ExamRoomsController, 'store'])
    router.patch('exams/:id/rooms/:roomId', [ExamRoomsController, 'update'])
    router.delete('exams/:id/rooms/:roomId', [ExamRoomsController, 'destroy'])

    router.get('exams/:id/rooms/:roomId/students', [ExamRoomStudentsController, 'index'])
    router.post('exams/:id/rooms/:roomId/students', [ExamRoomStudentsController, 'store'])
    router.post('exams/:id/rooms/:roomId/students/import', [
      ExamRoomStudentsController,
      'importStudents',
    ])
    router.delete('exams/:id/rooms/:roomId/students/:studentId', [
      ExamRoomStudentsController,
      'destroy',
    ])

    router.get('exams/:id/attempts', [AttemptsController, 'forExam'])
    router.get('attempts/:attemptId', [AttemptsController, 'show'])
    router.get('attempts/:attemptId/violations', [AttemptsController, 'violations'])
  })
  .prefix('/api/v1/teacher')
  .as('teacher')
  .use([middleware.auth(), middleware.rbac(['teacher', 'admin'])])
