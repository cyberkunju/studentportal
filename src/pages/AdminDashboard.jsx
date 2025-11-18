import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import Icon from '../components/Icon'
import Button from '../components/Button'
import api from '../services/api'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const user = api.getCurrentUser()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    activeNotices: 0
  })
  const [recentNotices, setRecentNotices] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Student/Teacher drill-down states
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [selectedYear, setSelectedYear] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login')
      return
    }
    
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch notices
      const noticesResult = await api.getNotices()
      if (noticesResult.success) {
        setRecentNotices(noticesResult.data.slice(0, 3))
        setStats(prev => ({ ...prev, activeNotices: noticesResult.data.length }))
      }
      // TODO: Add API calls for student/teacher/course counts
      setStats(prev => ({ ...prev, totalStudents: 1, totalTeachers: 5, totalCourses: 6 }))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl text-rich-black dark:text-alice-blue"
        >
          Loading...
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen pb-24 w-full px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-[1920px] mx-auto"
    >
      {/* Top Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-rich-black dark:text-alice-blue">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-rich-black/80 dark:text-alice-blue/80 font-medium">{user?.full_name}</span>
          <div className="w-10 h-10 rounded-full bg-picton-blue/20 flex items-center justify-center">
            <Icon name="user" size={20} color="currentColor" className="text-picton-blue" />
          </div>
          <Button
            onClick={handleLogout}
            variant="secondary"
            className="!bg-baby-blue hover:!bg-baby-blue-600"
          >
            <Icon name="logout" size={20} color="white" />
            <span>Logout</span>
          </Button>
        </div>
      </header>

      {/* Quick Stats - Interactive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowStudentModal(true)}
          className="bg-gradient-to-br from-picton-blue to-picton-blue-600 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-picton-blue/20 shadow-lg cursor-pointer transition-opacity duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/90 font-medium">View Students</p>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Icon name="users" size={24} color="white" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">Students</p>
          <p className="text-white/80 text-sm">Browse by year and department</p>
        </motion.div>

        <motion.div 
          whileHover={{ opacity: 0.9 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowTeacherModal(true)}
          className="bg-gradient-to-br from-baby-blue to-baby-blue-600 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-baby-blue/20 shadow-lg cursor-pointer transition-opacity duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/90 font-medium">View Teachers</p>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Icon name="user" size={24} color="white" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">Teachers</p>
          <p className="text-white/80 text-sm">Browse by department</p>
        </motion.div>
      </div>

      {/* Notifications Card */}
      <div className="mb-8">
        <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-picton-blue/20 flex items-center justify-center">
              <Icon name="bell" size={24} color="currentColor" className="text-picton-blue" />
            </div>
            <h3 className="text-lg font-bold text-rich-black dark:text-alice-blue">Notifications</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-rose-500/10 dark:bg-rose-500/20 rounded-lg transition-opacity duration-200 hover:opacity-90">
              <div>
                <span className="text-rich-black/70 dark:text-alice-blue/70 text-sm">Low Attendance</span>
                <p className="font-bold text-rose-600 dark:text-rose-400 text-2xl">8</p>
              </div>
              <Icon name="exclamation-circle" size={32} color="currentColor" className="text-rose-500/50" />
            </div>
            <div className="flex items-center justify-between p-4 bg-baby-blue/10 dark:bg-baby-blue/20 rounded-lg transition-opacity duration-200 hover:opacity-90">
              <div>
                <span className="text-rich-black/70 dark:text-alice-blue/70 text-sm">Pending Fees</span>
                <p className="font-bold text-baby-blue-700 dark:text-baby-blue-400 text-2xl">15</p>
              </div>
              <Icon name="creditCard" size={32} color="currentColor" className="text-baby-blue/50" />
            </div>
            <div className="flex items-center justify-between p-4 bg-picton-blue/10 dark:bg-picton-blue/20 rounded-lg transition-opacity duration-200 hover:opacity-90">
              <div>
                <span className="text-rich-black/70 dark:text-alice-blue/70 text-sm">Submissions Due</span>
                <p className="font-bold text-picton-blue-700 dark:text-picton-blue-400 text-2xl">23</p>
              </div>
              <Icon name="document" size={32} color="currentColor" className="text-picton-blue/50" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Functions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Manage Students */}
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          onClick={() => navigate('/admin/students')}
          className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:bg-picton-blue/10 dark:hover:bg-picton-blue/20 transition-all duration-200 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-picton-blue/20 flex items-center justify-center mb-4">
            <Icon name="users" size={24} color="currentColor" className="text-picton-blue" />
          </div>
          <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-2">Manage Students</h3>
          <p className="text-rich-black/60 dark:text-alice-blue/60 mb-4">Add, edit, or remove student records</p>
          <Button variant="primary" className="w-full">
            Open
          </Button>
        </motion.div>

        {/* Manage Teachers */}
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          onClick={() => navigate('/admin/teachers')}
          className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:bg-baby-blue/10 dark:hover:bg-baby-blue/20 transition-all duration-200 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-baby-blue/20 flex items-center justify-center mb-4">
            <Icon name="user" size={24} color="currentColor" className="text-baby-blue" />
          </div>
          <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-2">Manage Teachers</h3>
          <p className="text-rich-black/60 dark:text-alice-blue/60 mb-4">Add, edit, or remove teacher profiles</p>
          <Button variant="secondary" className="w-full">
            Open
          </Button>
        </motion.div>

        {/* Manage Courses */}
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          onClick={() => navigate('/admin/courses')}
          className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:bg-picton-blue/10 dark:hover:bg-picton-blue/20 transition-all duration-200 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-picton-blue/20 flex items-center justify-center mb-4">
            <Icon name="book" size={24} color="currentColor" className="text-picton-blue" />
          </div>
          <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-2">Manage Courses</h3>
          <p className="text-rich-black/60 dark:text-alice-blue/60 mb-4">Create and manage course catalog</p>
          <Button variant="primary" className="w-full">
            Open
          </Button>
        </motion.div>

        {/* Manage Enrollments */}
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:bg-baby-blue/10 dark:hover:bg-baby-blue/20 transition-all duration-200 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-baby-blue/20 flex items-center justify-center mb-4">
            <Icon name="document" size={24} color="currentColor" className="text-baby-blue" />
          </div>
          <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-2">Enrollments</h3>
          <p className="text-rich-black/60 dark:text-alice-blue/60 mb-4">Manage student course enrollments</p>
          <Button variant="secondary" className="w-full">
            Open
          </Button>
        </motion.div>

        {/* Post Notices */}
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          onClick={() => navigate('/admin/notices')}
          className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:bg-picton-blue/10 dark:hover:bg-picton-blue/20 transition-all duration-200 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-picton-blue/20 flex items-center justify-center mb-4">
            <Icon name="bell" size={24} color="currentColor" className="text-picton-blue" />
          </div>
          <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-2">Post Notices</h3>
          <p className="text-rich-black/60 dark:text-alice-blue/60 mb-4">Create and manage announcements</p>
          <Button variant="primary" className="w-full">
            Open
          </Button>
        </motion.div>

        {/* Fee Management */}
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          onClick={() => navigate('/admin/fee-management')}
          className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:bg-baby-blue/10 dark:hover:bg-baby-blue/20 transition-all duration-200 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-baby-blue/20 flex items-center justify-center mb-4">
            <Icon name="creditCard" size={24} color="currentColor" className="text-baby-blue" />
          </div>
          <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-2">Fee Management</h3>
          <p className="text-rich-black/60 dark:text-alice-blue/60 mb-4">Track and manage fee payments</p>
          <Button variant="secondary" className="w-full">
            Open
          </Button>
        </motion.div>

        {/* Academic Sessions */}
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          onClick={() => navigate('/admin/sessions')}
          className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:bg-picton-blue/10 dark:hover:bg-picton-blue/20 transition-all duration-200 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-picton-blue/20 flex items-center justify-center mb-4">
            <Icon name="calendar" size={24} color="currentColor" className="text-picton-blue" />
          </div>
          <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-2">Academic Sessions</h3>
          <p className="text-rich-black/60 dark:text-alice-blue/60 mb-4">Manage academic sessions and semesters</p>
          <Button variant="primary" className="w-full">
            Open
          </Button>
        </motion.div>

        {/* Reports & Analytics */}
        <motion.div 
          whileHover={{ opacity: 0.9 }}
          onClick={() => navigate('/admin/reports')}
          className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:bg-baby-blue/10 dark:hover:bg-baby-blue/20 transition-all duration-200 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-baby-blue/20 flex items-center justify-center mb-4">
            <Icon name="chart" size={24} color="currentColor" className="text-baby-blue" />
          </div>
          <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-2">Reports & Analytics</h3>
          <p className="text-rich-black/60 dark:text-alice-blue/60 mb-4">View performance, financial, and trends reports</p>
          <Button variant="secondary" className="w-full">
            Open
          </Button>
        </motion.div>
      </div>

      {/* Recent Notices */}
      {recentNotices.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-8 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg"
        >
          <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-4">Recent Notices</h3>
          <div className="space-y-3">
            {recentNotices.map((notice, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-picton-blue/10 dark:bg-picton-blue/20 rounded-lg transition-opacity duration-200 hover:opacity-90">
                <div className="w-10 h-10 rounded-full bg-picton-blue/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="bell" size={20} color="currentColor" className="text-picton-blue" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-rich-black dark:text-alice-blue">{notice.title}</h4>
                  <p className="text-sm text-rich-black/60 dark:text-alice-blue/60">{notice.content.substring(0, 100)}...</p>
                  <p className="text-xs text-rich-black/50 dark:text-alice-blue/50 mt-1">
                    {new Date(notice.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Student Browse Modal */}
      <AnimatePresence>
        {showStudentModal && (
          <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowStudentModal(false)
            setSelectedYear(null)
            setSelectedDepartment(null)
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 max-w-4xl w-full border border-white/20 dark:border-gray-700/20 shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-rich-black dark:text-alice-blue">Browse Students</h2>
              <button
                onClick={() => {
                  setShowStudentModal(false)
                  setSelectedYear(null)
                  setSelectedDepartment(null)
                }}
                className="w-10 h-10 rounded-full bg-white/20 dark:bg-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-700/30 flex items-center justify-center transition-all duration-200"
              >
                <Icon name="x" size={20} color="currentColor" className="text-rich-black dark:text-alice-blue" />
              </button>
            </div>

            {!selectedYear ? (
              /* Year Selection */
              <div>
                <h3 className="text-lg font-semibold text-rich-black dark:text-alice-blue mb-4">Select Academic Year</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((year) => (
                    <motion.button
                      key={year}
                      whileHover={{ opacity: 0.9 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedYear(year)}
                      className="p-6 bg-gradient-to-br from-picton-blue to-picton-blue-600 text-white rounded-xl font-bold text-lg shadow-lg transition-all duration-200"
                    >
                      <Icon name="users" size={32} color="white" className="mb-2" />
                      <p>{year}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : !selectedDepartment ? (
              /* Department Selection */
              <div>
                <button
                  onClick={() => setSelectedYear(null)}
                  className="mb-4 flex items-center gap-2 text-picton-blue dark:text-picton-blue-400 hover:opacity-80 transition-opacity duration-200"
                >
                  <Icon name="arrow-left" size={16} color="currentColor" />
                  Back to Year Selection
                </button>
                <h3 className="text-lg font-semibold text-rich-black dark:text-alice-blue mb-4">
                  Select Department - {selectedYear}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['BCA', 'BBA', 'B.Com', 'BSc Physics'].map((dept) => (
                    <motion.button
                      key={dept}
                      whileHover={{ opacity: 0.9 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedDepartment(dept)
                        // Navigate to students page with filters
                        navigate(`/admin/students?year=${selectedYear}&department=${dept}`)
                      }}
                      className="p-6 bg-gradient-to-br from-baby-blue to-baby-blue-600 text-white rounded-xl font-bold shadow-lg transition-all duration-200"
                    >
                      <Icon name="folder" size={32} color="white" className="mb-2" />
                      <p>{dept}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
        )}
      </AnimatePresence>

      {/* Teacher Browse Modal */}
      <AnimatePresence>
        {showTeacherModal && (
          <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowTeacherModal(false)
            setSelectedDepartment(null)
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 max-w-4xl w-full border border-white/20 dark:border-gray-700/20 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-rich-black dark:text-alice-blue">Browse Teachers</h2>
              <button
                onClick={() => {
                  setShowTeacherModal(false)
                  setSelectedDepartment(null)
                }}
                className="w-10 h-10 rounded-full bg-white/20 dark:bg-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-700/30 flex items-center justify-center transition-all duration-200"
              >
                <Icon name="x" size={20} color="currentColor" className="text-rich-black dark:text-alice-blue" />
              </button>
            </div>

            <h3 className="text-lg font-semibold text-rich-black dark:text-alice-blue mb-4">Select Department</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['BCA', 'BBA', 'B.Com', 'BSc Physics'].map((dept) => (
                <motion.button
                  key={dept}
                  whileHover={{ opacity: 0.9 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedDepartment(dept)
                    // Navigate to teachers page with filter
                    navigate(`/admin/teachers?department=${dept}`)
                  }}
                  className="p-6 bg-gradient-to-br from-baby-blue to-baby-blue-600 text-white rounded-xl font-bold shadow-lg transition-all duration-200"
                >
                  <Icon name="user" size={32} color="white" className="mb-2" />
                  <p>{dept}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
