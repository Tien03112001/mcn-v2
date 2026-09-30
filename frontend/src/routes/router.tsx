import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from '@/routes/ProtectedRoute'
import HomePage from '@/pages/landing/HomePage'
import LoginPage from '@/pages/auth/LoginPage'
import ForbiddenPage from '@/pages/ForbiddenPage'
import DocumentsPage from '@/pages/DocumentsPage'
import ProfilePage from '@/pages/ProfilePage'

import StaffLayout from '@/components/layout/StaffLayout'
import DashboardPage from '@/pages/admin/DashboardPage'
import UsersPage from '@/pages/admin/UsersPage'
import SubjectsPage from '@/pages/admin/SubjectsPage'
import TagsPage from '@/pages/admin/TagsPage'

import TeacherDashboardPage from '@/pages/teacher/DashboardPage'
import QuestionBankPage from '@/pages/teacher/QuestionBankPage'
import QuestionEditorPage from '@/pages/teacher/QuestionEditorPage'
import ExamsPage from '@/pages/teacher/ExamsPage'
import ExamEditorPage from '@/pages/teacher/ExamEditorPage'
import ExamRoomDetailPage from '@/pages/teacher/ExamRoomDetailPage'
import ExamResultsPage from '@/pages/teacher/ExamResultsPage'
import AttemptDetailPage from '@/pages/teacher/AttemptDetailPage'

import StudentLayout from '@/components/layout/StudentLayout'
import ExamListPage from '@/pages/student/ExamListPage'
import ExamTakingPage from '@/pages/student/ExamTakingPage'
import ExamResultPage from '@/pages/student/ExamResultPage'
import AttemptHistoryPage from '@/pages/student/AttemptHistoryPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/403', element: <ForbiddenPage /> },

  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <StaffLayout />,
        children: [
          { path: '/admin', element: <DashboardPage /> },
          { path: '/admin/users', element: <UsersPage /> },
          { path: '/admin/subjects', element: <SubjectsPage /> },
          { path: '/admin/tags', element: <TagsPage /> },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute allowedRoles={['teacher', 'admin']} />,
    children: [
      {
        element: <StaffLayout />,
        children: [
          { path: '/teacher', element: <TeacherDashboardPage /> },
          { path: '/documents', element: <DocumentsPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/teacher/questions', element: <QuestionBankPage /> },
          { path: '/teacher/questions/new', element: <QuestionEditorPage /> },
          { path: '/teacher/questions/:id', element: <QuestionEditorPage /> },
          { path: '/teacher/exams', element: <ExamsPage /> },
          { path: '/teacher/exams/:id', element: <ExamEditorPage /> },
          { path: '/teacher/exams/:examId/rooms/:roomId', element: <ExamRoomDetailPage /> },
          { path: '/teacher/exams/:id/results', element: <ExamResultsPage /> },
          { path: '/teacher/attempts/:attemptId', element: <AttemptDetailPage /> },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute allowedRoles={['student']} />,
    children: [
      { path: '/student/exams/:examRoomId/take', element: <ExamTakingPage /> },
      {
        element: <StudentLayout />,
        children: [
          { path: '/student', element: <ExamListPage /> },
          { path: '/documents', element: <DocumentsPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/student/history', element: <AttemptHistoryPage /> },
          { path: '/student/attempts/:attemptId/result', element: <ExamResultPage /> },
        ],
      },
    ],
  },
])
