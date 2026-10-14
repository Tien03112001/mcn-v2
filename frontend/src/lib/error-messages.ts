/**
 * Vietnamese messages for every `error.code` the backend returns in
 * `{ error: { code } }` responses. Keep in sync with backend controllers,
 * middleware and services (ExamAttemptError).
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  INVALID_CURRENT_PASSWORD: 'Mật khẩu hiện tại không đúng.',
  MISSING_REFRESH_TOKEN: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  INVALID_REFRESH_TOKEN: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  INVALID_TOKEN: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
  UNAUTHENTICATED: 'Bạn cần đăng nhập để tiếp tục.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',

  // Users
  USER_NOT_FOUND: 'Không tìm thấy người dùng.',
  STUDENT_NOT_FOUND: 'Không tìm thấy học viên.',

  // Subjects / topics / tags
  SUBJECT_NOT_FOUND: 'Không tìm thấy môn học.',
  SUBJECT_IN_USE: 'Không thể xóa: môn học này đang được dùng trong câu hỏi hoặc đề thi.',
  TOPIC_NOT_FOUND: 'Không tìm thấy chủ đề.',
  TAG_NOT_FOUND: 'Không tìm thấy thẻ.',

  // Questions
  QUESTION_NOT_FOUND: 'Không tìm thấy câu hỏi.',
  QUESTION_IN_USE: 'Không thể xóa: câu hỏi này đang được dùng trong một đề thi.',
  QUESTION_ALREADY_IN_EXAM: 'Câu hỏi này đã có trong đề thi.',
  ATTACHMENT_NOT_FOUND: 'Không tìm thấy tệp đính kèm.',

  // Exams
  EXAM_NOT_FOUND: 'Không tìm thấy đề thi.',
  EXAM_NOT_EDITABLE: 'Đề thi đã xuất bản, không thể chỉnh sửa.',
  EXAM_ALREADY_PUBLISHED: 'Đề thi đã được xuất bản.',
  EXAM_NOT_PUBLISHED: 'Đề thi chưa được xuất bản.',
  EXAM_HAS_NO_QUESTIONS: 'Đề thi chưa có câu hỏi nào.',
  EXAM_HAS_ATTEMPTS: 'Không thể xóa: đề thi này đã có học viên làm bài.',
  EXAM_HAS_NO_VARIANT: 'Đề thi chưa được xuất bản đúng cách.',
  EXAM_QUESTION_NOT_FOUND: 'Không tìm thấy câu hỏi trong đề thi.',

  // Exam rooms
  EXAM_ROOM_NOT_FOUND: 'Không tìm thấy phòng thi.',
  INVALID_SCHEDULE: 'Thời gian đóng phải sau thời gian mở.',
  ROOM_HAS_ATTEMPTS: 'Phòng thi đã có học viên làm bài, không thể xóa.',
  STUDENT_ALREADY_ADDED: 'Học viên đã có trong phòng thi.',
  ENROLLMENT_NOT_FOUND: 'Học viên không có trong phòng thi.',
  NOT_IN_ROOM: 'Bạn không có trong danh sách phòng thi này.',
  EXAM_NOT_OPEN_YET: 'Bài thi chưa đến giờ mở.',
  EXAM_CLOSED: 'Bài thi đã đóng.',

  // Attempts
  ATTEMPT_NOT_FOUND: 'Không tìm thấy bài làm.',
  ATTEMPT_ALREADY_EXISTS: 'Bạn đã làm bài thi này rồi.',
  ATTEMPT_ALREADY_CLOSED: 'Bài làm đã được nộp hoặc đã đóng.',
  ATTEMPT_EXPIRED: 'Đã hết thời gian làm bài.',
  ATTEMPT_NOT_SUBMITTED: 'Bài làm chưa được nộp.',

  // Files / documents
  INVALID_FILE: 'Định dạng file không được hỗ trợ.',
  FILE_NOT_FOUND: 'Không tìm thấy file.',
  DOCUMENT_NOT_FOUND: 'Không tìm thấy tài liệu.',
}
