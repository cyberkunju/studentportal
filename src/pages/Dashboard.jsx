import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import ThemeToggle from '../components/ThemeToggle'
import api from '../services/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [gpa, setGpa] = useState(0)
  const [cgpa, setCgpa] = useState(0)
  const [attendancePercent, setAttendancePercent] = useState(0)
  const [notices, setNotices] = useState([])
  const [upcomingFees, setUpcomingFees] = useState([])
  const user = api.getCurrentUser()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [marksResult, attendanceResult, noticesResult, feesResult] = await Promise.all([
          api.getMarks().catch(err => ({ success: false, error: err.message })),
          api.getAttendance().catch(err => ({ success: false, error: err.message })),
          api.getAllNotices().catch(err => ({ success: false, error: err.message })),
          api.getFees().catch(err => ({ success: false, error: err.message }))
        ])

        if (marksResult.success && marksResult.data) {
          const summary = marksResult.data.summary || {}
          setGpa(summary.gpa || 0)
          setCgpa(summary.cgpa || 0)
        }

        if (attendanceResult.success && attendanceResult.data) {
          const attendanceData = attendanceResult.data.attendance || []
          if (attendanceData.length > 0) {
            const avgPercentage = attendanceData.reduce((sum, item) => sum + parseFloat(item.percentage || 0), 0) / attendanceData.length
            setAttendancePercent(avgPercentage.toFixed(1))
          }
        }

        if (noticesResult.success && noticesResult.data) {
          setNotices((noticesResult.data.notices || []).slice(0, 3))
        }

        if (feesResult.success && feesResult.data) {
          const unpaidFees = (feesResult.data.fees || []).filter(fee => fee.payment_status !== 'completed')
          setUpcomingFees(unpaidFees.slice(0, 2))
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-slate-800 dark:text-white">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen pb-24 px-4 py-6 max-w-7xl mx-auto"
      >
      {/* Top Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-slate-700 dark:text-slate-300 font-medium">{user?.full_name || 'Student'}</span>
          {user?.profile_image ? (
            <img 
              src={user.profile_image} 
              alt={user.full_name} 
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Card */}
          <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg flex items-center gap-4">
            {user?.profile_image ? (
              <img 
                src={user.profile_image} 
                alt={user.full_name} 
                className="w-16 h-16 rounded-full object-cover border-4 border-indigo-500 flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 text-2xl font-bold">
                {user?.full_name?.charAt(0) || 'S'}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                Welcome Back, {user?.full_name?.split(' ')[0] || 'Student'}!
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {user?.department && `${user.department} • Semester ${user.semester || 'N/A'}`}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Academic Progress - GPA */}
            <div 
              onClick={() => navigate('/result')}
              className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition-all cursor-pointer"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Current GPA</h3>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">{gpa.toFixed(2)}</span>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Semester GPA</p>
              </div>
            </div>

            {/* CGPA */}
            <div 
              onClick={() => navigate('/analysis')}
              className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-purple-500/10 dark:hover:bg-purple-500/20 transition-all cursor-pointer"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Cumulative CGPA</h3>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-bold text-purple-600 dark:text-purple-400">{cgpa.toFixed(2)}</span>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Overall Performance</p>
              </div>
            </div>

            {/* Attendance */}
            <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-green-500/10 dark:hover:bg-green-500/20 transition-all cursor-pointer">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Attendance</h3>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-bold text-green-600 dark:text-green-400">{attendancePercent}%</span>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Overall Average</p>
              </div>
            </div>
          </div>

          {/* Upcoming Fees */}
          {upcomingFees.length > 0 && (
            <div 
              onClick={() => navigate('/payments')}
              className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-amber-500/10 dark:hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Pending Fees</h3>
              <div className="space-y-3">
                {upcomingFees.map((fee, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-white">{fee.fee_name}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Due: {new Date(fee.due_date).toLocaleDateString()}
                        {fee.current_late_fine > 0 && (
                          <span className="ml-2 text-red-600 dark:text-red-400">
                            +₹{fee.current_late_fine} late fine
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white">
                      ₹{parseFloat(fee.amount) + parseFloat(fee.current_late_fine || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/result')}
                className="p-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl transition-all text-center"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-white">View Results</div>
              </button>
              <button
                onClick={() => navigate('/subjects')}
                className="p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl transition-all text-center"
              >
                <div className="text-2xl mb-2">📚</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-white">Subjects</div>
              </button>
              <button
                onClick={() => navigate('/payments')}
                className="p-4 bg-green-500/20 hover:bg-green-500/30 rounded-xl transition-all text-center"
              >
                <div className="text-2xl mb-2">💳</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-white">Payments</div>
              </button>
              <button
                onClick={() => navigate('/notice')}
                className="p-4 bg-amber-500/20 hover:bg-amber-500/30 rounded-xl transition-all text-center"
              >
                <div className="text-2xl mb-2">📢</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-white">Notices</div>
              </button>
            </div>
          </div>

          {/* Download Documents */}
          <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Download Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={async () => {
                  try {
                    await api.downloadIDCard()
                    alert('✅ ID Card downloaded successfully!')
                  } catch (error) {
                    alert(`❌ Failed to download ID Card: ${error.message}`)
                  }
                }}
                className="p-4 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-xl transition-all text-center"
              >
                <div className="text-2xl mb-2">🪪</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-white">Download ID Card</div>
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.downloadPerformanceReport()
                    alert('✅ Performance Report downloaded successfully!')
                  } catch (error) {
                    alert(`❌ Failed to download report: ${error.message}`)
                  }
                }}
                className="p-4 bg-teal-500/20 hover:bg-teal-500/30 rounded-xl transition-all text-center"
              >
                <div className="text-2xl mb-2">📄</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-white">Performance Report</div>
              </button>
              <button
                onClick={() => navigate('/payments')}
                className="p-4 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-xl transition-all text-center"
              >
                <div className="text-2xl mb-2">🧾</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-white">Payment Receipts</div>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Sidebar */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Recent Notices</h3>
          
          {notices.length === 0 ? (
            <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg text-center">
              <div className="text-4xl text-slate-400 mb-3">🔔</div>
              <p className="text-slate-600 dark:text-slate-400">No notices yet</p>
            </div>
          ) : (
            notices.map((notice, index) => (
              <div 
                key={index}
                onClick={() => navigate('/notice')}
                className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-lg hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition-all cursor-pointer"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                    📢
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-1 truncate">
                      {notice.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {notice.content?.substring(0, 100)}
                      {notice.content?.length > 100 && '...'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {new Date(notice.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}

          {notices.length > 0 && (
            <button
              onClick={() => navigate('/notice')}
              className="w-full py-2 text-center text-blue-500 hover:text-blue-600 font-semibold"
            >
              View All Notices →
            </button>
          )}
        </div>
      </div>
      </motion.div>
      <Navigation />
    </>
  )
}
