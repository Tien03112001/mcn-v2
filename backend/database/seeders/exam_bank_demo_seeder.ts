import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import User from '#models/user'
import Subject from '#models/subject'
import Topic from '#models/topic'
import Question, { type AnswerConfig } from '#models/question'
import Exam from '#models/exam'
import ExamQuestion from '#models/exam_question'
import ExamRoom from '#models/exam_room'

const SURNAMES = [
  'Nguyễn',
  'Trần',
  'Lê',
  'Phạm',
  'Hoàng',
  'Huỳnh',
  'Phan',
  'Vũ',
  'Võ',
  'Đặng',
  'Bùi',
  'Đỗ',
  'Hồ',
  'Ngô',
  'Dương',
]
const MIDDLE_NAMES = ['Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Ngọc', 'Thanh', 'Xuân', 'Quang', 'Thu']
const GIVEN_NAMES = [
  'An',
  'Bình',
  'Cường',
  'Dũng',
  'Duy',
  'Đạt',
  'Giang',
  'Hà',
  'Hải',
  'Hạnh',
  'Hiếu',
  'Hoa',
  'Hùng',
  'Huy',
  'Khang',
  'Khánh',
  'Lâm',
  'Linh',
  'Long',
  'Mai',
  'Minh',
  'My',
  'Nam',
  'Ngân',
  'Nhi',
  'Phong',
  'Phúc',
  'Phương',
  'Quân',
  'Quỳnh',
  'Sơn',
  'Tâm',
  'Thảo',
  'Thắng',
  'Thịnh',
  'Trang',
  'Trung',
  'Tuấn',
  'Tú',
  'Uyên',
  'Việt',
  'Vy',
  'Yến',
  'Bảo',
  'Châu',
]

function studentName(i: number) {
  const surname = SURNAMES[i % SURNAMES.length]
  const middle = MIDDLE_NAMES[(i * 3) % MIDDLE_NAMES.length]
  const given = GIVEN_NAMES[(i * 7) % GIVEN_NAMES.length]
  return `${surname} ${middle} ${given}`
}

type Difficulty = 'easy' | 'medium' | 'hard'

interface QuestionSeed {
  content: string
  explanation: string
  type: 'single_choice' | 'multiple_choice' | 'true_false_group' | 'short_answer'
  difficulty: Difficulty
  options?: { label: string; content: string; isCorrect: boolean }[]
  parts?: { label: string; content: string; isCorrect: boolean }[]
  answerConfig: Record<string, unknown>
}

function singleChoice(
  content: string,
  choices: [string, boolean][],
  difficulty: Difficulty,
  explanation: string
): QuestionSeed {
  const labels = ['A', 'B', 'C', 'D']
  return {
    content,
    explanation,
    type: 'single_choice',
    difficulty,
    answerConfig: {},
    options: choices.map(([text, isCorrect], i) => ({
      label: labels[i],
      content: text,
      isCorrect,
    })),
  }
}

function multipleChoice(
  content: string,
  choices: [string, boolean][],
  difficulty: Difficulty,
  explanation: string
): QuestionSeed {
  const labels = ['A', 'B', 'C', 'D']
  return {
    content,
    explanation,
    type: 'multiple_choice',
    difficulty,
    answerConfig: { scoringMode: 'all_or_nothing' },
    options: choices.map(([text, isCorrect], i) => ({
      label: labels[i],
      content: text,
      isCorrect,
    })),
  }
}

function trueFalseGroup(
  content: string,
  statements: [string, boolean][],
  difficulty: Difficulty,
  explanation: string
): QuestionSeed {
  const labels = ['a', 'b', 'c', 'd']
  return {
    content,
    explanation,
    type: 'true_false_group',
    difficulty,
    answerConfig: { partialScoring: [0, 0.1, 0.25, 0.5, 1] },
    parts: statements.map(([text, isCorrect], i) => ({
      label: labels[i],
      content: text,
      isCorrect,
    })),
  }
}

function shortAnswerNumber(
  content: string,
  correctValue: number,
  difficulty: Difficulty,
  explanation: string
): QuestionSeed {
  return {
    content,
    explanation,
    type: 'short_answer',
    difficulty,
    answerConfig: { answerType: 'number', correctValue, tolerance: 0 },
  }
}

function shortAnswerString(
  content: string,
  correctValue: string,
  acceptedAlternatives: string[],
  difficulty: Difficulty,
  explanation: string
): QuestionSeed {
  return {
    content,
    explanation,
    type: 'short_answer',
    difficulty,
    answerConfig: {
      answerType: 'string',
      correctValue,
      caseSensitive: false,
      trim: true,
      acceptedAlternatives,
    },
  }
}

const QUESTIONS: QuestionSeed[] = [
  singleChoice(
    'Đơn vị nào sau đây dùng để đo tốc độ xử lý của CPU?',
    [
      ['Hertz (Hz)', true],
      ['Byte', false],
      ['Bit', false],
      ['Pixel', false],
    ],
    'easy',
    'Tốc độ CPU được đo bằng Hertz (Hz), thể hiện số chu kỳ xử lý mỗi giây.'
  ),
  singleChoice(
    'Bộ nhớ nào sau đây là bộ nhớ trong (bộ nhớ chính) của máy tính?',
    [
      ['RAM', true],
      ['Ổ cứng HDD', false],
      ['USB', false],
      ['Đĩa CD', false],
    ],
    'easy',
    'RAM (Random Access Memory) là bộ nhớ trong, dùng để lưu dữ liệu tạm thời khi máy đang chạy.'
  ),
  singleChoice(
    '1 Byte bằng bao nhiêu bit?',
    [
      ['4 bit', false],
      ['8 bit', true],
      ['16 bit', false],
      ['32 bit', false],
    ],
    'easy',
    '1 Byte = 8 bit, đây là đơn vị cơ bản để biểu diễn dữ liệu trong máy tính.'
  ),
  singleChoice(
    'Thiết bị nào sau đây là thiết bị đầu vào (input)?',
    [
      ['Máy in', false],
      ['Loa', false],
      ['Bàn phím', true],
      ['Màn hình', false],
    ],
    'easy',
    'Bàn phím dùng để nhập dữ liệu vào máy tính nên là thiết bị đầu vào.'
  ),
  singleChoice(
    'Hệ điều hành nào sau đây KHÔNG phải là hệ điều hành mã nguồn mở?',
    [
      ['Linux', false],
      ['Ubuntu', false],
      ['Windows', true],
      ['Android', false],
    ],
    'medium',
    'Windows là hệ điều hành thương mại, mã nguồn đóng; Linux, Ubuntu, Android đều dựa trên mã nguồn mở.'
  ),
  singleChoice(
    'Phần mềm nào sau đây dùng để soạn thảo văn bản?',
    [
      ['Excel', false],
      ['Word', true],
      ['PowerPoint', false],
      ['Access', false],
    ],
    'easy',
    'Microsoft Word là phần mềm soạn thảo văn bản trong bộ Microsoft Office.'
  ),
  singleChoice(
    'Địa chỉ IP phiên bản 4 (IPv4) có độ dài bao nhiêu bit?',
    [
      ['16 bit', false],
      ['32 bit', true],
      ['64 bit', false],
      ['128 bit', false],
    ],
    'medium',
    'IPv4 sử dụng địa chỉ 32 bit, thường biểu diễn dưới dạng 4 nhóm số thập phân (VD: 192.168.1.1).'
  ),
  singleChoice(
    'Giao thức nào sau đây dùng để truyền tải trang web?',
    [
      ['FTP', false],
      ['SMTP', false],
      ['HTTP', true],
      ['POP3', false],
    ],
    'medium',
    'HTTP (HyperText Transfer Protocol) là giao thức chuẩn để truyền tải nội dung web.'
  ),
  singleChoice(
    'Đuôi file nào sau đây thường dùng cho file nén?',
    [
      ['.docx', false],
      ['.zip', true],
      ['.mp3', false],
      ['.exe', false],
    ],
    'easy',
    '.zip là định dạng file nén phổ biến, giúp giảm dung lượng lưu trữ.'
  ),
  singleChoice(
    'RAM là viết tắt của cụm từ nào?',
    [
      ['Random Access Memory', true],
      ['Read Access Memory', false],
      ['Run Application Memory', false],
      ['Real Access Module', false],
    ],
    'easy',
    'RAM = Random Access Memory, bộ nhớ truy cập ngẫu nhiên.'
  ),
  singleChoice(
    'Trong Excel, hàm nào dùng để tính tổng một dãy số?',
    [
      ['AVERAGE', false],
      ['SUM', true],
      ['COUNT', false],
      ['MAX', false],
    ],
    'easy',
    'Hàm SUM dùng để cộng tổng các giá trị trong một vùng dữ liệu.'
  ),
  singleChoice(
    'Thiết bị nào sau đây lưu trữ dữ liệu lâu dài, không mất khi tắt máy?',
    [
      ['RAM', false],
      ['Ổ cứng (HDD/SSD)', true],
      ['Cache của CPU', false],
      ['Thanh ghi CPU', false],
    ],
    'medium',
    'Ổ cứng là bộ nhớ ngoài, lưu dữ liệu bền vững kể cả khi mất điện, khác với RAM là bộ nhớ tạm.'
  ),
  singleChoice(
    'Virus máy tính lây lan chủ yếu qua con đường nào?',
    [
      ['Chỉ qua email', false],
      ['Qua file đính kèm, USB, mạng Internet', true],
      ['Chỉ qua USB', false],
      ['Virus không thể lây lan', false],
    ],
    'medium',
    'Virus có thể lây lan qua nhiều con đường: file tải về, USB, email, lỗ hổng mạng...'
  ),
  singleChoice(
    'Mạng LAN là viết tắt của cụm từ nào?',
    [
      ['Local Area Network', true],
      ['Long Area Network', false],
      ['Large Access Network', false],
      ['Limited Area Network', false],
    ],
    'easy',
    'LAN = Local Area Network, mạng máy tính cục bộ trong phạm vi nhỏ như văn phòng, trường học.'
  ),
  singleChoice(
    'Phần mềm nào sau đây là trình duyệt web?',
    [
      ['Google Chrome', true],
      ['Microsoft Word', false],
      ['Adobe Photoshop', false],
      ['WinRAR', false],
    ],
    'easy',
    'Google Chrome là trình duyệt web, dùng để truy cập Internet và xem trang web.'
  ),
  singleChoice(
    'Số nhị phân 1010 tương ứng với số thập phân nào?',
    [
      ['8', false],
      ['9', false],
      ['10', true],
      ['11', false],
    ],
    'hard',
    '1010(2) = 1×8 + 0×4 + 1×2 + 0×1 = 10 trong hệ thập phân.'
  ),
  singleChoice(
    'Người dùng KHÔNG nên làm gì để bảo vệ dữ liệu cá nhân?',
    [
      ['Đặt mật khẩu mạnh', false],
      ['Chia sẻ mật khẩu công khai cho người khác', true],
      ['Cập nhật phần mềm thường xuyên', false],
      ['Bật xác thực hai lớp (2FA)', false],
    ],
    'medium',
    'Chia sẻ mật khẩu công khai làm lộ thông tin và là hành vi mất an toàn, cần tránh.'
  ),
  singleChoice(
    'Định dạng file nào sau đây thường dùng để lưu ảnh?',
    [
      ['.docx', false],
      ['.jpg', true],
      ['.mp3', false],
      ['.exe', false],
    ],
    'easy',
    '.jpg (JPEG) là định dạng ảnh nén phổ biến, dùng rộng rãi trên web và máy ảnh số.'
  ),
  multipleChoice(
    'Những thiết bị nào sau đây là thiết bị ngoại vi (peripheral) của máy tính? (chọn nhiều đáp án đúng)',
    [
      ['Bàn phím', true],
      ['Chuột', true],
      ['CPU', false],
      ['Máy in', true],
    ],
    'medium',
    'Thiết bị ngoại vi là thiết bị kết nối với máy tính từ bên ngoài (bàn phím, chuột, máy in); CPU là bộ xử lý trung tâm, không phải ngoại vi.'
  ),
  multipleChoice(
    'Những phần mềm nào sau đây thuộc bộ Microsoft Office? (chọn nhiều đáp án đúng)',
    [
      ['Word', true],
      ['Excel', true],
      ['Photoshop', false],
      ['PowerPoint', true],
    ],
    'easy',
    'Word, Excel, PowerPoint đều thuộc bộ Microsoft Office; Photoshop là phần mềm của Adobe.'
  ),
  multipleChoice(
    'Những hành động nào sau đây giúp phòng chống virus máy tính? (chọn nhiều đáp án đúng)',
    [
      ['Cài phần mềm diệt virus', true],
      ['Mở file lạ từ email không rõ nguồn gốc', false],
      ['Cập nhật hệ điều hành thường xuyên', true],
      ['Không cắm USB lạ vào máy', true],
    ],
    'medium',
    'Cài phần mềm diệt virus, cập nhật hệ điều hành và tránh USB lạ giúp phòng chống virus; mở file lạ làm tăng nguy cơ nhiễm virus.'
  ),
  multipleChoice(
    'Những đơn vị nào sau đây dùng để đo dung lượng bộ nhớ? (chọn nhiều đáp án đúng)',
    [
      ['Byte', true],
      ['Hertz', false],
      ['KB', true],
      ['GB', true],
    ],
    'easy',
    'Byte, KB, GB là các đơn vị đo dung lượng lưu trữ; Hertz là đơn vị đo tần số (tốc độ xử lý).'
  ),
  multipleChoice(
    'Những thiết bị nào sau đây là thiết bị đầu ra (output)? (chọn nhiều đáp án đúng)',
    [
      ['Màn hình', true],
      ['Máy in', true],
      ['Bàn phím', false],
      ['Loa', true],
    ],
    'medium',
    'Màn hình, máy in, loa xuất thông tin ra cho người dùng nên là thiết bị đầu ra; bàn phím là thiết bị đầu vào.'
  ),
  trueFalseGroup(
    'Xét các phát biểu sau về mạng Internet:',
    [
      ['Internet là một mạng máy tính toàn cầu', true],
      ['Internet chỉ hoạt động trong phạm vi một quốc gia', false],
      ['Mỗi máy tính kết nối Internet đều có một địa chỉ IP', true],
      ['Internet và World Wide Web (WWW) là hai khái niệm hoàn toàn giống nhau', false],
    ],
    'hard',
    'Internet là hạ tầng mạng toàn cầu, còn Web (WWW) chỉ là một trong các dịch vụ chạy trên Internet.'
  ),
  trueFalseGroup(
    'Xét các phát biểu sau về phần cứng máy tính:',
    [
      ['CPU được coi là "bộ não" của máy tính', true],
      ['RAM là bộ nhớ lưu trữ dữ liệu vĩnh viễn', false],
      ['Ổ SSD có tốc độ đọc/ghi nhanh hơn ổ HDD', true],
      ['Chuột và bàn phím là thiết bị xử lý trung tâm', false],
    ],
    'medium',
    'RAM mất dữ liệu khi tắt máy (bộ nhớ tạm); chuột/bàn phím là thiết bị nhập, không xử lý trung tâm.'
  ),
  trueFalseGroup(
    'Xét các phát biểu sau về bảo mật thông tin:',
    [
      ['Mật khẩu càng dài và phức tạp thì càng an toàn', true],
      ['Nên dùng chung một mật khẩu cho tất cả tài khoản', false],
      ['Xác thực hai yếu tố (2FA) giúp tăng cường bảo mật tài khoản', true],
      ['Click vào mọi liên kết trong email lạ là an toàn', false],
    ],
    'hard',
    'Dùng chung mật khẩu và click link lạ đều làm tăng rủi ro bảo mật; mật khẩu mạnh và 2FA giúp tài khoản an toàn hơn.'
  ),
  shortAnswerNumber(
    '1 Kilobyte (KB) bằng bao nhiêu Byte? (chỉ nhập số)',
    1024,
    'medium',
    '1 KB = 1024 Byte theo cách tính nhị phân truyền thống (2^10).'
  ),
  shortAnswerNumber(
    'Đổi số nhị phân 1111 sang hệ thập phân, kết quả bằng bao nhiêu? (chỉ nhập số)',
    15,
    'hard',
    '1111(2) = 1×8 + 1×4 + 1×2 + 1×1 = 15.'
  ),
  shortAnswerString(
    'Tổ hợp phím tắt để sao chép (copy) trong Windows là gì?',
    'Ctrl+C',
    ['ctrl+c', 'Ctrl + C'],
    'easy',
    'Ctrl+C là phím tắt sao chép tiêu chuẩn trên Windows.'
  ),
  shortAnswerString(
    'Tổ hợp phím tắt để lưu tệp (save) trong Windows là gì?',
    'Ctrl+S',
    ['ctrl+s', 'Ctrl + S'],
    'easy',
    'Ctrl+S là phím tắt lưu tệp tiêu chuẩn trên Windows.'
  ),
]

/**
 * Seeds one complete, ready-to-test scenario: a "Tin học đại cương" subject
 * with a 30-question bank, a published 1-period exam built from all 30, and
 * one exam room with 45 students already enrolled. Safe to re-run: skips
 * entirely if the subject already exists.
 */
export default class extends BaseSeeder {
  async run() {
    const existing = await Subject.query().where('code', 'THDC').first()
    if (existing) {
      return
    }

    const subject = await Subject.create({
      code: 'THDC',
      name: 'Tin học đại cương',
      description: 'Kiến thức nền tảng về phần cứng, phần mềm, mạng máy tính và an toàn thông tin.',
    })

    const topics = await Topic.createMany([
      { subjectId: subject.id, name: 'Phần cứng máy tính', orderIndex: 0 },
      { subjectId: subject.id, name: 'Phần mềm & Hệ điều hành', orderIndex: 1 },
      { subjectId: subject.id, name: 'Mạng máy tính & Internet', orderIndex: 2 },
      { subjectId: subject.id, name: 'An toàn thông tin', orderIndex: 3 },
    ])

    const teacher = await User.create({
      fullName: 'Nguyễn Văn Giáo',
      email: 'giaovien.thdc@mcn.local',
      password: 'Teacher@123',
      role: 'teacher',
      isActive: true,
    })

    const students = []
    for (let i = 1; i <= 45; i++) {
      const student = await User.create({
        fullName: studentName(i),
        email: `sv${String(i).padStart(2, '0')}@mcn.local`,
        password: 'Student@123',
        role: 'student',
        studentCode: `TH2026${String(i).padStart(3, '0')}`,
        isActive: true,
      })
      students.push(student)
    }

    const exam = new Exam()
    exam.subjectId = subject.id
    exam.createdBy = teacher.id
    exam.title = 'Kiểm tra 1 tiết - Tin học đại cương'
    exam.description = 'Bài kiểm tra 1 tiết đánh giá kiến thức nền tảng môn Tin học đại cương.'
    exam.durationMinutes = 45
    exam.totalScoreNumber = 30
    exam.maxViolationCount = 3
    exam.status = 'draft'
    exam.generationMode = 'manual'
    await exam.save()

    let orderIndex = 0
    for (const q of QUESTIONS) {
      const question = await Question.create({
        subjectId: subject.id,
        topicId: topics[orderIndex % topics.length].id,
        createdBy: teacher.id,
        questionType: q.type,
        difficulty: q.difficulty,
        content: q.content,
        explanation: q.explanation,
        answerConfig: q.answerConfig as AnswerConfig,
        isActive: true,
      })

      if (q.options) {
        await question
          .related('options')
          .createMany(q.options.map((o, i) => ({ ...o, orderIndex: i })))
      }
      if (q.parts) {
        await question.related('parts').createMany(q.parts.map((p, i) => ({ ...p, orderIndex: i })))
      }

      const examQuestion = new ExamQuestion()
      examQuestion.examId = exam.id
      examQuestion.questionId = question.id
      examQuestion.orderIndex = orderIndex
      examQuestion.scoreNumber = 1
      await examQuestion.save()

      orderIndex++
    }

    exam.status = 'published'
    await exam.save()
    await exam
      .related('variants')
      .create({ variantCode: 'GOC', questionOrderMap: null, optionOrderMap: null })

    const now = DateTime.now()
    const room = await ExamRoom.create({
      examId: exam.id,
      name: 'Phòng máy A101',
      opensAt: now,
      closesAt: now.plus({ days: 14 }),
      createdBy: teacher.id,
    })

    await room.related('students').attach(students.map((s) => s.id))
  }
}
