import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import api from '../services/api'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [studentCount, setStudentCount] = useState(0)
  const [notices, setNotices] = useState([])
  const user = api.getCurrentUser()

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/login')
      return
    }

    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const [studentsResult, noticesResult] = await Promise.all([
        api.getStudents().catch(err => ({ success: false })),
        api.getAllNotices().catch(err => ({ success: false }))
      ])

      if (studentsResult.success && studentsResult.data) {
        setStudentCount(studentsResult.data.students?.length || 0)
      }

      if (noticesResult.success && noticesResult.data) {
        setNotices((noticesResult.data.notices || []).slice(0, 3))
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    api.logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-slate-800 dark:text-white">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-24 px-4 py-6 max-w-7xl mx-auto"
    >
      {/* Top Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Teacher Dashboard</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-slate-700 dark:text-slate-300 font-medium">{user?.full_name}</span>
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
            <div className="text-lg">👨‍🏫</div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <div className="text-3xl">👨‍🏫</div>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Welcome, {user?.full_name}!</h2>
            <p className="text-green-100">Faculty Portal • {user?.department || 'Department'}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          onClick={() => navigate('/teacher/students')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/90 font-medium">My Students</p>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <div className="text-white text-xl">👥</div>
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{studentCount}</p>
          <p className="text-blue-100 text-sm">Total enrolled students</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          onClick={() => navigate('/teacher/notices')}
          className="bg-gradient-to-br from-purple-500 to-purple-600 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/90 font-medium">Notices</p>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <div className="text-white text-xl">📢</div>
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{notices.length}</p>
          <p className="text-purple-100 text-sm">Recent announcements</p>
        </motion.div>
      </div>

      {/* Teacher Functions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add Marks */}
        <div 
          onClick={() => navigate('/teacher/marks')}
          className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-green-500/10 dark:hover:bg-green-500/20 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <div className="text-2xl">✍️</div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Enter Marks</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Add or update student marks</p>
          <button className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all">
            Open
          </button>
        </div>

        {/* Attendance */}
        <div 
          onClick={() => navigate('/teacher/attendance')}
          className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-orange-500/10 dark:hover:bg-orange-500/20 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
            <div className="text-2xl">📅</div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Attendance</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Mark student attendance</p>
          <button className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all">
            Open
          </button>
        </div>

        {/* Student List */}
        <div 
          onClick={() => navigate('/teacher/students')}
          className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-blue-500/10 dark:hover:bg-blue-500/20 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
            <div className="text-2xl">👥</div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Student List</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">View enrolled students</p>
          <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all">
            Open
          </button>
        </div>

        {/* Announcements */}
        <div 
          onClick={() => navigate('/teacher/notices')}
          className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-teal-500/10 dark:hover:bg-teal-500/20 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mb-4">
            <div className="text-2xl">📢</div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Announcements</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">View class notices</p>
          <button className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-all">
            Open
          </button>
        </div>

        {/* View Reports */}
        <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-purple-500/10 dark:hover:bg-purple-500/20 transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
            <div className="text-2xl">📊</div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Reports</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Class performance analytics</p>
          <button className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all">
            Coming Soon
          </button>
        </div>

        {/* Settings */}
        <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-gray-500/10 dark:hover:bg-gray-500/20 transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-gray-500/20 flex items-center justify-center mb-4">
            <div className="text-2xl">⚙️</div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Settings</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Manage your preferences</p>
          <button className="w-full py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all">
            Coming Soon
          </button>
        </div>
      </div>

      {/* Recent Notices */}
      {notices.length > 0 && (
        <div className="mt-8 bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Recent Notices</h2>
          <div className="space-y-3">
            {notices.map((notice, index) => (
              <div
                key={index}
                onClick={() => navigate('/teacher/notices')}
                className="p-4 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30 transition-all cursor-pointer"
              >
                <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
                  {notice.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                  {notice.content}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  {new Date(notice.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
