import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'admin.users.store': { paramsTuple?: []; params?: {} }
    'admin.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.users.reset_password': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.index': { paramsTuple?: []; params?: {} }
    'admin.classes.store': { paramsTuple?: []; params?: {} }
    'admin.classes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.students': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.add_student': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.import_students': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.remove_student': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'studentId': ParamValue} }
    'admin.classes.assign_teacher': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.remove_teacher': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'teacherId': ParamValue} }
    'admin.subjects.store': { paramsTuple?: []; params?: {} }
    'admin.subjects.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.subjects.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.topics.store': { paramsTuple: [ParamValue]; params: {'subjectId': ParamValue} }
    'admin.topics.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.topics.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.tags.store': { paramsTuple?: []; params?: {} }
    'admin.tags.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.tags.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'adminReadonly.subjects.index': { paramsTuple?: []; params?: {} }
    'adminReadonly.subjects.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'adminReadonly.topics.index': { paramsTuple: [ParamValue]; params: {'subjectId': ParamValue} }
    'adminReadonly.tags.index': { paramsTuple?: []; params?: {} }
    'files.files.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.questions.index': { paramsTuple?: []; params?: {} }
    'teacher.questions.store': { paramsTuple?: []; params?: {} }
    'teacher.questions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.questions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.questions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.attachments.store': { paramsTuple: [ParamValue]; params: {'questionId': ParamValue} }
    'teacher.attachments.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'questionId': ParamValue,'fileId': ParamValue} }
    'teacher.exams.index': { paramsTuple?: []; params?: {} }
    'teacher.exams.store': { paramsTuple?: []; params?: {} }
    'teacher.exams.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exams.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exams.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exams.publish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exam_questions.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exam_questions.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exam_questions.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'examQuestionId': ParamValue} }
    'teacher.exam_questions.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'examQuestionId': ParamValue} }
    'teacher.exam_classes.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exam_classes.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exam_classes.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'examClassId': ParamValue} }
    'teacher.exam_classes.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'examClassId': ParamValue} }
    'teacher.attempts.for_exam': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.attempts.show': { paramsTuple: [ParamValue]; params: {'attemptId': ParamValue} }
    'teacher.attempts.violations': { paramsTuple: [ParamValue]; params: {'attemptId': ParamValue} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.refresh': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'student.exams.index': { paramsTuple?: []; params?: {} }
    'student.exams.show': { paramsTuple: [ParamValue]; params: {'examClassId': ParamValue} }
    'student.attempts.start': { paramsTuple: [ParamValue]; params: {'examClassId': ParamValue} }
    'student.attempts.history': { paramsTuple?: []; params?: {} }
    'student.attempts.show': { paramsTuple: [ParamValue]; params: {'attemptId': ParamValue} }
    'student.attempts.save_answer': { paramsTuple: [ParamValue,ParamValue]; params: {'attemptId': ParamValue,'questionId': ParamValue} }
    'student.attempts.report_violation': { paramsTuple: [ParamValue]; params: {'attemptId': ParamValue} }
    'student.attempts.submit': { paramsTuple: [ParamValue]; params: {'attemptId': ParamValue} }
    'student.attempts.result': { paramsTuple: [ParamValue]; params: {'attemptId': ParamValue} }
  }
  GET: {
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'admin.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.index': { paramsTuple?: []; params?: {} }
    'admin.classes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.students': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'adminReadonly.subjects.index': { paramsTuple?: []; params?: {} }
    'adminReadonly.subjects.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'adminReadonly.topics.index': { paramsTuple: [ParamValue]; params: {'subjectId': ParamValue} }
    'adminReadonly.tags.index': { paramsTuple?: []; params?: {} }
    'files.files.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.questions.index': { paramsTuple?: []; params?: {} }
    'teacher.questions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exams.index': { paramsTuple?: []; params?: {} }
    'teacher.exams.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exam_questions.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exam_classes.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.attempts.for_exam': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.attempts.show': { paramsTuple: [ParamValue]; params: {'attemptId': ParamValue} }
    'teacher.attempts.violations': { paramsTuple: [ParamValue]; params: {'attemptId': ParamValue} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'student.exams.index': { paramsTuple?: []; params?: {} }
    'student.exams.show': { paramsTuple: [ParamValue]; params: {'examClassId': ParamValue} }
    'student.attempts.history': { paramsTuple?: []; params?: {} }
    'student.attempts.show': { paramsTuple: [ParamValue]; params: {'attemptId': ParamValue} }
    'student.attempts.result': { paramsTuple: [ParamValue]; params: {'attemptId': ParamValue} }
  }
  HEAD: {
    'admin.users.index': { paramsTuple?: []; params?: {} }
    'admin.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.index': { paramsTuple?: []; params?: {} }
    'admin.classes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.students': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'adminReadonly.subjects.index': { paramsTuple?: []; params?: {} }
    'adminReadonly.subjects.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'adminReadonly.topics.index': { paramsTuple: [ParamValue]; params: {'subjectId': ParamValue} }
    'adminReadonly.tags.index': { paramsTuple?: []; params?: {} }
    'files.files.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.questions.index': { paramsTuple?: []; params?: {} }
    'teacher.questions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exams.index': { paramsTuple?: []; params?: {} }
    'teacher.exams.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exam_questions.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exam_classes.index': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.attempts.for_exam': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.attempts.show': { paramsTuple: [ParamValue]; params: {'attemptId': ParamValue} }
    'teacher.attempts.violations': { paramsTuple: [ParamValue]; params: {'attemptId': ParamValue} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'student.exams.index': { paramsTuple?: []; params?: {} }
    'student.exams.show': { paramsTuple: [ParamValue]; params: {'examClassId': ParamValue} }
    'student.attempts.history': { paramsTuple?: []; params?: {} }
    'student.attempts.show': { paramsTuple: [ParamValue]; params: {'attemptId': ParamValue} }
    'student.attempts.result': { paramsTuple: [ParamValue]; params: {'attemptId': ParamValue} }
  }
  POST: {
    'admin.users.store': { paramsTuple?: []; params?: {} }
    'admin.users.reset_password': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.store': { paramsTuple?: []; params?: {} }
    'admin.classes.add_student': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.import_students': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.assign_teacher': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.subjects.store': { paramsTuple?: []; params?: {} }
    'admin.topics.store': { paramsTuple: [ParamValue]; params: {'subjectId': ParamValue} }
    'admin.tags.store': { paramsTuple?: []; params?: {} }
    'teacher.questions.store': { paramsTuple?: []; params?: {} }
    'teacher.attachments.store': { paramsTuple: [ParamValue]; params: {'questionId': ParamValue} }
    'teacher.exams.store': { paramsTuple?: []; params?: {} }
    'teacher.exams.publish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exam_questions.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exam_classes.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.refresh': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'student.attempts.start': { paramsTuple: [ParamValue]; params: {'examClassId': ParamValue} }
    'student.attempts.report_violation': { paramsTuple: [ParamValue]; params: {'attemptId': ParamValue} }
    'student.attempts.submit': { paramsTuple: [ParamValue]; params: {'attemptId': ParamValue} }
  }
  PATCH: {
    'admin.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.subjects.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.topics.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.tags.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.questions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exams.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exam_questions.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'examQuestionId': ParamValue} }
    'teacher.exam_classes.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'examClassId': ParamValue} }
  }
  DELETE: {
    'admin.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.classes.remove_student': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'studentId': ParamValue} }
    'admin.classes.remove_teacher': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'teacherId': ParamValue} }
    'admin.subjects.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.topics.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.tags.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.questions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.attachments.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'questionId': ParamValue,'fileId': ParamValue} }
    'teacher.exams.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'teacher.exam_questions.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'examQuestionId': ParamValue} }
    'teacher.exam_classes.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'examClassId': ParamValue} }
  }
  PUT: {
    'student.attempts.save_answer': { paramsTuple: [ParamValue,ParamValue]; params: {'attemptId': ParamValue,'questionId': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}