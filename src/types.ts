export type PaymentStatus = 'paid' | 'unpaid' | 'partial';
export type AttendanceStatus = 'present' | 'absent' | 'excused';
export type UserRole = 'student' | 'admin' | 'teacher';

export interface User {
  id: string;
  fullName: string;
  username: string;
  role: UserRole;
  groupId?: string;
  groups?: string[];
  subject?: string;
  monthlyFee?: number;
  phone?: string;
  joinedDate?: string;
  createdAt: string;
  teacherId?: string;
  lastActive?: string;
  dailyUsage?: Record<string, number>;
  password?: string;
}
export interface Group {
  id: string;
  name: string;
  teacherName: string;
  subject: string;
  createdAt: string;
  days?: string[];
  startTime?: string;
  endTime?: string;
  schedule?: Record<string, { startTime: string; endTime: string }>;
}
export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  month: number;      // 1-12
  year: number;
  status: PaymentStatus;
  paidAt: string;     // ISO datetime
  createdAt: string;
}
export interface Attendance {
  id: string;
  studentId: string;
  groupId?: string;
  date: string;       // YYYY-MM-DD
  status: AttendanceStatus;
  createdAt: string;
}
export interface ScheduleItem {
  id: string;
  groupId: string;
  dayOfWeek: number;   // 1=Dushanba ... 7=Yakshanba
  startTime: string;   // "14:00"
  endTime: string;     // "16:00"
  subject: string;
  location: string;
  teacherName?: string;
}
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  color: string;      // #FEC204 kabi
  publishedAt: string;
  active: boolean;
  likes?: string[];
  viewedBy?: string[];
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  comments?: { id: string, userId: string, userName: string, text: string, createdAt: string }[];
}
export interface Exam {
  id: string;
  title: string;
  subject: string;
  groupId?: string; // Kept for backwards compatibility
  groupIds?: string[];
  date: string;
  startTime: string;
  duration: number;
  location: string;
  description?: string;
  testId?: string;
  testSources?: { testId: string; name: string; count: number; randomizeQuestions?: boolean; randomizeOptions?: boolean }[];
  isOnline?: boolean;
  examType?: string;
  maxAttempts?: number;
  randomizeQuestions?: boolean;
  status?: 'active' | 'ended';
  finalizedAt?: string;      // imtihon yakunlangan vaqt
  raschReport?: any;         // yakunlanganda muzlatilgan Rasch hisoboti { results, stats }
  syntheticEnabled?: boolean; // qo'shimcha (sintetik) o'quvchilar qo'shilsinmi
  syntheticCount?: number;    // nechta sintetik o'quvchi qo'shiladi
  createdAt: string;
}

export interface TestQuestion {
  id: string;
  text: string;
  imageUrl?: string;
  options: string[];
  correctOptionIndex: number;
  isOpenEnded?: boolean;
  correctAnswerText?: string;
  subAnswers?: { label: "a" | "b"; correctAnswerText: string }[];
}

export interface TestCategory {
  id: string;
  name: string;
}

export interface TestData {
  id?: string;
  title: string;
  questionCount: number;
  variantCount: number;
  testType: string;
  format?: "rasch" | "normal";
  satType?: string;
  isFastMode?: boolean;
  maxAttempts?: number;
  questions: TestQuestion[];
  createdAt: string;
}

export interface ExamResult {
  id?: string;
  examId: string;
  studentId: string;
  studentName: string;
  score: number;
  total: number;
  wrongAnswers?: string[];
  timeSpent?: number;
  attempts?: number;
  submittedAt: string;
  raschItems?: number[];
}

export interface Certificate {
  id?: string;
  studentId: string;
  examId: string;
  subject: string;
  ball: number;
  grade: string;
  issuedAt: string;
}