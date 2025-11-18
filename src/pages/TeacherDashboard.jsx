import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import Icon from '../components/Icon'
import Button from '../components/Button'
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
        <div className="text-2xl text-rich-black dark:text-alice-blue">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen pb-24 px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 w-full max-w-[1920px] mx-auto"
    >
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-rich-black dark:text-alice-blue">Teacher Dashboard</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-rich-black/80 dark:text-alice-blue/80 font-medium">{user?.full_name}</span>
          <div className="w-10 h-10 rounded-full bg-picton-blue/20 backdrop-blur-xl border border-picton-blue/30 flex items-center justify-center">
            <Icon name="user" size={20} color="currentColor" className="text-picton-blue" />
          </div>
          <Button
            onClick={handleLogout}
            variant="secondary"
            className="hover:bg-baby-blue/20"
          >
            <Icon name="logout" size={20} color="currentColor" />
            <span>Logout</span>
          </Button>
        </div>
      </header>

      {/* Welcome Card */}
      <div className="bg-white/30 dark:bg-rich-black/30 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-picton-blue/20 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-picton-blue/20 backdrop-blur-xl border border-picton-blue/30 flex items-center justify-center">
            <Icon name="user" size={32} color="currentColor" className="text-picton-blue" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-rich-black dark:text-alice-blue">Welcome, {user?.full_name}!</h2>
            <p className="text-rich-black/70 dark:text-alice-blue/70">Faculty Portal • {user?.department || 'Department'}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          onClick={() => navigate('/teacher/students')}
          className="bg-white/20 dark:bg-rich-black/20 backdrop-blur-xl rounded-2xl p-6 border-l-4 border-picton-blue shadow-lg cursor-pointer transition-opacity duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-rich-black/80 dark:text-alice-blue/80 font-medium">My Students</p>
            <div className="w-10 h-10 rounded-full bg-picton-blue/20 flex items-center justify-center">
              <Icon name="users" size={20} color="currentColor" className="text-picton-blue" />
            </div>
          </div>
          <p className="text-4xl font-bold text-rich-black dark:text-alice-blue mb-1">{studentCount}</p>
          <p className="text-rich-black/60 dark:text-alice-blue/60 text-sm">Total enrolled students</p>
        </motion.div>

        <motion.div 
          whileHover={{ opacity: 0.9 }}
          onClick={() => navigate('/teacher/notices')}
          className="bg-white/20 dark:bg-rich-black/20 backdrop-blur-xl rounded-2xl p-6 border-l-4 border-baby-blue shadow-lg cursor-pointer transition-opacity duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-rich-black/80 dark:text-alice-blue/80 font-medium">Notices</p>
            <div className="w-10 h-10 rounded-full bg-baby-blue/20 flex items-center justify-center">
              <Icon name="bell" size={20} color="currentColor" className="text-baby-blue" />
            </div>
          </div>
          <p className="text-4xl font-bold text-rich-black dark:text-alice-blue mb-1">{notices.length}</p>
          <p className="text-rich-black/60 dark:text-alice-blue/60 text-sm">Recent announcements</p>
        </motion.div>
      </div>

      {/* Teacher Functions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Enter Marks */}
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          onClick={() => navigate('/teacher/marks')}
          className="bg-white/20 dark:bg-rich-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg cursor-pointer transition-opacity duration-200"
        >
          <div className="w-12 h-12 rounded-full bg-picton-blue/20 flex items-center justify-center mb-4">
            <Icon name="edit" size={24} color="currentColor" className="text-picton-blue" />
          </div>
          <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-2">Enter Marks</h3>
          <p className="text-rich-black/70 dark:text-alice-blue/70 mb-4">Add or update student marks</p>
          <Button variant="primary" className="w-full">
            Open
          </Button>
        </motion.div>

        {/* Attendance */}
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          onClick={() => navigate('/teacher/attendance')}
          className="bg-white/20 dark:bg-rich-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg cursor-pointer transition-opacity duration-200"
        >
          <div className="w-12 h-12 rounded-full bg-baby-blue/20 flex items-center justify-center mb-4">
            <Icon name="calendar" size={24} color="currentColor" className="text-baby-blue" />
          </div>
          <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-2">Attendance</h3>
          <p className="text-rich-black/70 dark:text-alice-blue/70 mb-4">Mark student attendance</p>
          <Button variant="secondary" className="w-full">
            Open
          </Button>
        </motion.div>

        {/* Student List */}
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          onClick={() => navigate('/teacher/students')}
          className="bg-white/20 dark:bg-rich-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg cursor-pointer transition-opacity duration-200"
        >
          <div className="w-12 h-12 rounded-full bg-picton-blue/20 flex items-center justify-center mb-4">
            <Icon name="users" size={24} color="currentColor" className="text-picton-blue" />
          </div>
          <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-2">Student List</h3>
          <p className="text-rich-black/70 dark:text-alice-blue/70 mb-4">View enrolled students</p>
          <Button variant="primary" className="w-full">
            Open
          </Button>
        </motion.div>

        {/* Announcements */}
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          onClick={() => navigate('/teacher/notices')}
          className="bg-white/20 dark:bg-rich-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg cursor-pointer transition-opacity duration-200"
        >
          <div className="w-12 h-12 rounded-full bg-baby-blue/20 flex items-center justify-center mb-4">
            <Icon name="bell" size={24} color="currentColor" className="text-baby-blue" />
          </div>
          <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-2">Announcements</h3>
          <p className="text-rich-black/70 dark:text-alice-blue/70 mb-4">View class notices</p>
          <Button variant="secondary" className="w-full">
            Open
          </Button>
        </motion.div>

        {/* Assignments */}
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          onClick={() => navigate('/teacher/assignments')}
          className="bg-white/20 dark:bg-rich-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg cursor-pointer transition-opacity duration-200"
        >
          <div className="w-12 h-12 rounded-full bg-picton-blue/20 flex items-center justify-center mb-4">
            <Icon name="document" size={24} color="currentColor" className="text-picton-blue" />
          </div>
          <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-2">Assignments</h3>
          <p className="text-rich-black/70 dark:text-alice-blue/70 mb-4">Manage student assignments</p>
          <Button variant="primary" className="w-full">
            Open
          </Button>
        </motion.div>

        {/* View Reports */}
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          className="bg-white/20 dark:bg-rich-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg cursor-pointer transition-opacity duration-200"
        >
          <div className="w-12 h-12 rounded-full bg-picton-blue/20 flex items-center justify-center mb-4">
            <Icon name="chart" size={24} color="currentColor" className="text-picton-blue" />
          </div>
          <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-2">Reports</h3>
          <p className="text-rich-black/70 dark:text-alice-blue/70 mb-4">Class performance analytics</p>
          <Button variant="ghost" className="w-full" disabled>
            Coming Soon
          </Button>
        </motion.div>

        {/* Settings */}
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          className="bg-white/20 dark:bg-rich-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg cursor-pointer transition-opacity duration-200"
        >
          <div className="w-12 h-12 rounded-full bg-baby-blue/20 flex items-center justify-center mb-4">
            <Icon name="settings" size={24} color="currentColor" className="text-baby-blue" />
          </div>
          <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-2">Settings</h3>
          <p className="text-rich-black/70 dark:text-alice-blue/70 mb-4">Manage your preferences</p>
          <Button variant="ghost" className="w-full" disabled>
            Coming Soon
          </Button>
        </motion.div>
      </div>

      {/* Recent Notices */}
      {notices.length > 0 && (
        <div className="mt-8 bg-white/20 dark:bg-rich-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg">
          <h2 className="text-2xl font-bold text-rich-black dark:text-alice-blue mb-4">Recent Notices</h2>
          <div className="space-y-3">
            {notices.map((notice, index) => (
              <motion.div
                key={index}
                whileHover={{ opacity: 0.9 }}
                onClick={() => navigate('/teacher/notices')}
                className="p-4 bg-picton-blue/10 dark:bg-picton-blue/20 rounded-xl cursor-pointer transition-opacity duration-200"
              >
                <h4 className="font-semibold text-rich-black dark:text-alice-blue mb-1">
                  {notice.title}
                </h4>
                <p className="text-sm text-rich-black/70 dark:text-alice-blue/70 line-clamp-1">
                  {notice.content}
                </p>
                <p className="text-xs text-rich-black/50 dark:text-alice-blue/50 mt-1">
                  {new Date(notice.created_at).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
