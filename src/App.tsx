import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RootLayout } from './components/RootLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConfirmProvider } from './contexts/ConfirmContext';
import AdminLayout from './components/AdminLayout';
import StudentLayout from './components/StudentLayout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminGroups from './pages/admin/AdminGroups';
import AdminStudents from './pages/admin/AdminStudents';
import AdminPayments from './pages/admin/AdminPayments';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminMore from './pages/admin/AdminMore';
import AdminExams from './pages/admin/AdminExams';
import AdminTestsDatabase from './pages/admin/AdminTestsDatabase';
import AdminNews from './pages/admin/AdminNews';
import AdminHomeworks from './pages/admin/AdminHomeworks';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentPayments from './pages/student/StudentPayments';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentSchedule from './pages/student/StudentSchedule';
import StudentProfile from './pages/student/StudentProfile';
import StudentHomeworks from './pages/student/StudentHomeworks';
import StudentExams from './pages/student/StudentExams';
import StudentResults from './pages/student/StudentResults';
import StudentRegistration from './pages/StudentRegistration';
import TeacherRegistration from './pages/TeacherRegistration';

function AuthGuard({ children, roles }: { children: React.ReactNode, roles: string[] }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#0d0d0d]">
      <div className="w-10 h-10 border-4 border-[#FEC204] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }
  
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
}

function DefaultRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin' || user.role === 'teacher') return <Navigate to="/admin" replace />;
  return <Navigate to="/student" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConfirmProvider>
        <ErrorBoundary>
          <Routes>
          <Route element={<RootLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/qoshil" element={<StudentRegistration />} />
            <Route path="/oqituvchi-qoshil" element={<TeacherRegistration />} />
            <Route path="/" element={<DefaultRoute />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AuthGuard roles={['admin', 'teacher']}>
                <AdminLayout />
              </AuthGuard>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="groups" element={<AdminGroups />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="more" element={<AdminMore />} />
              <Route path="tests" element={<AdminTestsDatabase />} />
              <Route path="exams" element={<AdminExams />} />
              <Route path="homeworks" element={<AdminHomeworks />} />
              <Route path="news" element={<AdminNews />} />
            </Route>

            {/* Student Routes */}
            <Route path="/student" element={
              <AuthGuard roles={['student']}>
                <StudentLayout />
              </AuthGuard>
            }>
              <Route index element={<StudentDashboard />} />
              <Route path="payments" element={<StudentPayments />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="schedule" element={<StudentSchedule />} />
              <Route path="homeworks" element={<StudentHomeworks />} />
              <Route path="exams" element={<StudentExams />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="profile" element={<Navigate to="/student" replace />} />
            </Route>
          </Route>
          </Routes>
        </ErrorBoundary>
      </ConfirmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

