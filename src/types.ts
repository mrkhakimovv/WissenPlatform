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
}
export interface Exam {
  id: string;
  title: string;
  subject: string;
  groupId?: string;
  date: string;
  startTime: string;
  duration: number;
  location: string;
  description?: string;
  testId?: string;
  testSources?: { testId: string; name: string; count: number }[];
  isOnline?: boolean;
  createdAt: string;
}

export interface TestQuestion {
  id: string;
  text: string;
  imageUrl?: string;
  options: string[];
  correctOptionIndex: number;
}

export interface TestData {
  id?: string;
  title: string;
  questionCount: number;
  variantCount: number;
  testType: string;
  questions: TestQuestion[];
  createdAt: string;
}
