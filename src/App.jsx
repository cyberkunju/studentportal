import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Notice from './pages/Notice'
import Payments from './pages/Payments'
import Subjects from './pages/Subjects'
import Result from './pages/Result'
import Analysis from './pages/Analysis'
import AdminDashboard from './pages/AdminDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import AdminStudents from './pages/admin/AdminStudents'
import AdminTeachers from './pages/admin/AdminTeachers'
import AdminNotices from './pages/admin/AdminNotices'
import AdminFeeManagement from './pages/admin/AdminFeeManagement'
import AdminCourses from './pages/admin/AdminCourses'
import AdminSessions from './pages/admin/AdminSessions'
import AdminReports from './pages/admin/AdminReports'
import TeacherAttendance from './pages/TeacherAttendance'
import TeacherStudentList from './pages/TeacherStudentList'
import TeacherNotice from './pages/TeacherNotice'
import TeacherMarks from './pages/TeacherMarks'
import TeacherAssignments from './pages/TeacherAssignments'
import VirtualID from './pages/VirtualID'
import api from './services/api'

// Protected Route wrapper
function ProtectedRoute({ children, allowedRoles = [] }) {
  const isAuthenticated = api.isAuthenticated()
  const user = api.getCurrentUser()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Student Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['student']}><Dashboard /></ProtectedRoute>} />
          <Route path="/notice" element={<ProtectedRoute allowedRoles={['student']}><Notice /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute allowedRoles={['student']}><Payments /></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute allowedRoles={['student']}><Subjects /></ProtectedRoute>} />
          <Route path="/result" element={<ProtectedRoute allowedRoles={['student']}><Result /></ProtectedRoute>} />
          <Route path="/analysis" element={<ProtectedRoute allowedRoles={['student']}><Analysis /></ProtectedRoute>} />
          <Route path="/virtual-id" element={<ProtectedRoute allowedRoles={['student']}><VirtualID /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>} />
          <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['admin']}><AdminTeachers /></ProtectedRoute>} />
          <Route path="/admin/notices" element={<ProtectedRoute allowedRoles={['admin']}><AdminNotices /></ProtectedRoute>} />
          <Route path="/admin/fee-management" element={<ProtectedRoute allowedRoles={['admin']}><AdminFeeManagement /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><AdminCourses /></ProtectedRoute>} />
          <Route path="/admin/sessions" element={<ProtectedRoute allowedRoles={['admin']}><AdminSessions /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
          
          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAttendance /></ProtectedRoute>} />
          <Route path="/teacher/students" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherStudentList /></ProtectedRoute>} />
          <Route path="/teacher/notices" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherNotice /></ProtectedRoute>} />
          <Route path="/teacher/marks" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherMarks /></ProtectedRoute>} />
          <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>
    </Router>
  )
}

export default App
