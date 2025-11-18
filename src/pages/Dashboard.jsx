import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import ThemeToggle from '../components/ThemeToggle'
import Icon from '../components/Icon'
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
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-picton-blue rounded-2xl mb-4 animate-pulse">
            <Icon name="chart" size={32} color="white" ariaLabel="Loading" />
          </div>
          <div className="text-xl text-rich-black dark:text-alice-blue font-medium">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl mb-4">
            <Icon name="exclamationCircle" size={32} className="text-red-600 dark:text-red-400" ariaLabel="Error" />
          </div>
          <div className="text-xl text-rich-black dark:text-alice-blue font-semibold mb-2">Failed to Load</div>
          <div className="text-rich-black/60 dark:text-alice-blue/60 mb-6">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-picton-blue text-white rounded-xl hover:bg-picton-blue-600 font-semibold transition-all duration-200 active:scale-95"
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen pb-24 px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 w-full max-w-[1920px] mx-auto"
      >
      {/* Top Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-rich-black dark:text-alice-blue mb-1">Dashboard</h1>
          <p className="text-rich-black/60 dark:text-alice-blue/60 text-sm">
            {user?.department && `${user.department} • Semester ${user.semester || 'N/A'}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-3 bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl border border-rich-black/10 dark:border-alice-blue/10 rounded-xl px-4 py-2">
            <span className="text-rich-black/80 dark:text-alice-blue/80 font-medium">{user?.full_name || 'Student'}</span>
            {user?.profile_image ? (
              <img 
                src={user.profile_image} 
                alt={user.full_name} 
                className="w-10 h-10 rounded-full object-cover border-2 border-picton-blue"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-picton-blue flex items-center justify-center text-white font-bold">
                {user?.full_name?.charAt(0) || 'S'}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl rounded-2xl p-6 border border-rich-black/10 dark:border-alice-blue/10 shadow-lg"
          >
            <div className="flex items-center gap-4 mb-6">
              {user?.profile_image ? (
                <img 
                  src={user.profile_image} 
                  alt={user.full_name} 
                  className="w-16 h-16 rounded-full object-cover border-4 border-picton-blue flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-picton-blue to-baby-blue flex items-center justify-center text-white flex-shrink-0 text-2xl font-bold">
                  {user?.full_name?.charAt(0) || 'S'}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-rich-black dark:text-alice-blue mb-1">
                  Welcome Back, {user?.full_name?.split(' ')[0] || 'Student'}!
                </h2>
                <p className="text-rich-black/60 dark:text-alice-blue/60 text-sm">
                  Here's your academic overview
                </p>
              </div>
            </div>
            
            {/* Quick Stats Bar */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-rich-black/10 dark:border-alice-blue/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-picton-blue">{gpa.toFixed(2)}</div>
                <div className="text-xs text-rich-black/60 dark:text-alice-blue/60 mt-1">Current GPA</div>
              </div>
              <div className="text-center border-l border-r border-rich-black/10 dark:border-alice-blue/10">
                <div className="text-2xl font-bold text-baby-blue">{cgpa.toFixed(2)}</div>
                <div className="text-xs text-rich-black/60 dark:text-alice-blue/60 mt-1">CGPA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00B894]">{attendancePercent}%</div>
                <div className="text-xs text-rich-black/60 dark:text-alice-blue/60 mt-1">Attendance</div>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Academic Progress - GPA */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              onClick={() => navigate('/result')}
              className="bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl rounded-2xl p-6 border border-rich-black/10 dark:border-alice-blue/10 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-picton-blue/10 flex items-center justify-center group-hover:bg-picton-blue/20 transition-colors duration-200">
                    <Icon name="chart" size={20} color="currentColor" className="text-picton-blue" />
                  </div>
                  <h3 className="text-sm font-semibold text-rich-black/60 dark:text-alice-blue/60">Current GPA</h3>
                </div>
                <Icon name="arrowRight" size={16} className="text-rich-black/40 dark:text-alice-blue/40 group-hover:text-picton-blue transition-colors duration-200" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-picton-blue">{gpa.toFixed(2)}</span>
                <span className="text-sm text-rich-black/60 dark:text-alice-blue/60">/ 10.0</span>
              </div>
              <p className="mt-2 text-xs text-rich-black/60 dark:text-alice-blue/60">Semester Performance</p>
            </motion.div>

            {/* CGPA */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              onClick={() => navigate('/analysis')}
              className="bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl rounded-2xl p-6 border border-rich-black/10 dark:border-alice-blue/10 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-baby-blue/10 flex items-center justify-center group-hover:bg-baby-blue/20 transition-colors duration-200">
                    <Icon name="trendingUp" size={20} color="currentColor" className="text-baby-blue" />
                  </div>
                  <h3 className="text-sm font-semibold text-rich-black/60 dark:text-alice-blue/60">Cumulative CGPA</h3>
                </div>
                <Icon name="arrowRight" size={16} className="text-rich-black/40 dark:text-alice-blue/40 group-hover:text-baby-blue transition-colors duration-200" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-baby-blue">{cgpa.toFixed(2)}</span>
                <span className="text-sm text-rich-black/60 dark:text-alice-blue/60">/ 10.0</span>
              </div>
              <p className="mt-2 text-xs text-rich-black/60 dark:text-alice-blue/60">Overall Performance</p>
            </motion.div>

            {/* Attendance */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl rounded-2xl p-6 border border-rich-black/10 dark:border-alice-blue/10 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00B894]/10 flex items-center justify-center group-hover:bg-[#00B894]/20 transition-colors duration-200">
                    <Icon name="checkCircle" size={20} color="currentColor" className="text-[#00B894]" />
                  </div>
                  <h3 className="text-sm font-semibold text-rich-black/60 dark:text-alice-blue/60">Attendance</h3>
                </div>
                <Icon name="arrowRight" size={16} className="text-rich-black/40 dark:text-alice-blue/40 group-hover:text-[#00B894] transition-colors duration-200" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#00B894]">{attendancePercent}%</span>
              </div>
              <p className="mt-2 text-xs text-rich-black/60 dark:text-alice-blue/60">Overall Average</p>
            </motion.div>
          </div>

          {/* Upcoming Fees - Semantic Warning Color */}
          {upcomingFees.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              onClick={() => navigate('/payments')}
              className="bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl rounded-2xl p-6 border border-[#F2C94C]/30 dark:border-[#F2C94C]/20 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F2C94C]/10 flex items-center justify-center">
                    <Icon name="exclamationCircle" size={20} color="currentColor" className="text-[#F2C94C]" />
                  </div>
                  <h3 className="text-lg font-bold text-rich-black dark:text-alice-blue">Pending Fees</h3>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-[#F2C94C]/20 text-[#F2C94C] rounded-full">
                  {upcomingFees.length} Pending
                </span>
              </div>
              <div className="space-y-3">
                {upcomingFees.map((fee, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-rich-black/5 dark:bg-alice-blue/5 rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-semibold text-rich-black dark:text-alice-blue mb-1">{fee.fee_name}</h4>
                      <div className="flex items-center gap-2 text-xs text-rich-black/60 dark:text-alice-blue/60">
                        <Icon name="calendar" size={14} />
                        <span>Due: {new Date(fee.due_date).toLocaleDateString()}</span>
                      </div>
                      {fee.current_late_fine > 0 && (
                        <div className="mt-1 inline-flex items-center gap-1 text-xs text-[#E74C3C]">
                          <Icon name="alertCircle" size={12} />
                          <span>+₹{fee.current_late_fine} late fine</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-rich-black dark:text-alice-blue">
                        ₹{parseFloat(fee.amount) + parseFloat(fee.current_late_fine || 0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2.5 bg-picton-blue text-white rounded-xl font-semibold hover:bg-picton-blue-600 transition-colors duration-200">
                Pay Now
              </button>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl rounded-2xl p-6 border border-rich-black/10 dark:border-alice-blue/10 shadow-lg"
          >
            <h3 className="text-lg font-bold text-rich-black dark:text-alice-blue mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => navigate('/result')}
                className="p-4 bg-rich-black/5 dark:bg-alice-blue/5 hover:bg-picton-blue/10 dark:hover:bg-picton-blue/10 rounded-xl transition-all duration-200 text-center group border border-transparent hover:border-picton-blue/20"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-picton-blue/10 flex items-center justify-center group-hover:bg-picton-blue/20 transition-colors duration-200">
                  <Icon name="chart" size={24} color="currentColor" className="text-picton-blue" />
                </div>
                <div className="text-xs font-semibold text-rich-black dark:text-alice-blue">Results</div>
              </button>
              <button
                onClick={() => navigate('/subjects')}
                className="p-4 bg-rich-black/5 dark:bg-alice-blue/5 hover:bg-baby-blue/10 dark:hover:bg-baby-blue/10 rounded-xl transition-all duration-200 text-center group border border-transparent hover:border-baby-blue/20"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-baby-blue/10 flex items-center justify-center group-hover:bg-baby-blue/20 transition-colors duration-200">
                  <Icon name="book" size={24} color="currentColor" className="text-baby-blue" />
                </div>
                <div className="text-xs font-semibold text-rich-black dark:text-alice-blue">Subjects</div>
              </button>
              <button
                onClick={() => navigate('/payments')}
                className="p-4 bg-rich-black/5 dark:bg-alice-blue/5 hover:bg-picton-blue/10 dark:hover:bg-picton-blue/10 rounded-xl transition-all duration-200 text-center group border border-transparent hover:border-picton-blue/20"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-picton-blue/10 flex items-center justify-center group-hover:bg-picton-blue/20 transition-colors duration-200">
                  <Icon name="creditCard" size={24} color="currentColor" className="text-picton-blue" />
                </div>
                <div className="text-xs font-semibold text-rich-black dark:text-alice-blue">Payments</div>
              </button>
              <button
                onClick={() => navigate('/notice')}
                className="p-4 bg-rich-black/5 dark:bg-alice-blue/5 hover:bg-baby-blue/10 dark:hover:bg-baby-blue/10 rounded-xl transition-all duration-200 text-center group border border-transparent hover:border-baby-blue/20"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-baby-blue/10 flex items-center justify-center group-hover:bg-baby-blue/20 transition-colors duration-200">
                  <Icon name="bell" size={24} color="currentColor" className="text-baby-blue" />
                </div>
                <div className="text-xs font-semibold text-rich-black dark:text-alice-blue">Notices</div>
              </button>
              <button
                onClick={() => navigate('/virtual-id')}
                className="p-4 bg-rich-black/5 dark:bg-alice-blue/5 hover:bg-picton-blue/10 dark:hover:bg-picton-blue/10 rounded-xl transition-all duration-200 text-center group border border-transparent hover:border-picton-blue/20"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-picton-blue/10 to-baby-blue/10 flex items-center justify-center group-hover:from-picton-blue/20 group-hover:to-baby-blue/20 transition-colors duration-200">
                  <Icon name="user" size={24} color="currentColor" className="text-picton-blue" />
                </div>
                <div className="text-xs font-semibold text-rich-black dark:text-alice-blue">Virtual ID</div>
              </button>
            </div>
          </motion.div>

          {/* Download Documents */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.45 }}
            className="bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl rounded-2xl p-6 border border-rich-black/10 dark:border-alice-blue/10 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-picton-blue/10 flex items-center justify-center">
                <Icon name="download" size={20} color="currentColor" className="text-picton-blue" />
              </div>
              <h3 className="text-lg font-bold text-rich-black dark:text-alice-blue">Download Documents</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={async () => {
                  try {
                    await api.downloadIDCard()
                    alert('✅ ID Card downloaded successfully!')
                  } catch (error) {
                    alert(`❌ Failed to download ID Card: ${error.message}`)
                  }
                }}
                className="p-4 bg-rich-black/5 dark:bg-alice-blue/5 hover:bg-picton-blue/10 dark:hover:bg-picton-blue/10 rounded-xl transition-all duration-200 text-center group border border-transparent hover:border-picton-blue/20"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-picton-blue/10 flex items-center justify-center group-hover:bg-picton-blue/20 transition-colors duration-200">
                  <Icon name="user" size={24} color="currentColor" className="text-picton-blue" />
                </div>
                <div className="text-xs font-semibold text-rich-black dark:text-alice-blue">ID Card</div>
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
                className="p-4 bg-rich-black/5 dark:bg-alice-blue/5 hover:bg-baby-blue/10 dark:hover:bg-baby-blue/10 rounded-xl transition-all duration-200 text-center group border border-transparent hover:border-baby-blue/20"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-baby-blue/10 flex items-center justify-center group-hover:bg-baby-blue/20 transition-colors duration-200">
                  <Icon name="document" size={24} color="currentColor" className="text-baby-blue" />
                </div>
                <div className="text-xs font-semibold text-rich-black dark:text-alice-blue">Report</div>
              </button>
              <button
                onClick={() => navigate('/payments')}
                className="p-4 bg-rich-black/5 dark:bg-alice-blue/5 hover:bg-picton-blue/10 dark:hover:bg-picton-blue/10 rounded-xl transition-all duration-200 text-center group border border-transparent hover:border-picton-blue/20"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-picton-blue/10 flex items-center justify-center group-hover:bg-picton-blue/20 transition-colors duration-200">
                  <Icon name="document" size={24} color="currentColor" className="text-picton-blue" />
                </div>
                <div className="text-xs font-semibold text-rich-black dark:text-alice-blue">Receipts</div>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Notifications Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-rich-black dark:text-alice-blue">Recent Notices</h3>
            {notices.length > 0 && (
              <span className="text-xs font-semibold px-2 py-1 bg-picton-blue/10 text-picton-blue rounded-full">
                {notices.length} New
              </span>
            )}
          </div>
          
          {notices.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl rounded-2xl p-8 border border-rich-black/10 dark:border-alice-blue/10 shadow-lg text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rich-black/5 dark:bg-alice-blue/5 flex items-center justify-center">
                <Icon name="bell" size={32} color="currentColor" className="text-rich-black/40 dark:text-alice-blue/40" />
              </div>
              <p className="text-rich-black/60 dark:text-alice-blue/60 text-sm">No notices yet</p>
            </motion.div>
          ) : (
            notices.map((notice, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + (index * 0.05) }}
                onClick={() => navigate('/notice')}
                className="bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl rounded-2xl p-4 border border-rich-black/10 dark:border-alice-blue/10 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-picton-blue/10 flex items-center justify-center flex-shrink-0 group-hover:bg-picton-blue/20 transition-colors duration-200">
                    <Icon name="bell" size={18} color="currentColor" className="text-picton-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-rich-black dark:text-alice-blue mb-1 truncate text-sm">
                      {notice.title}
                    </h4>
                    <p className="text-xs text-rich-black/60 dark:text-alice-blue/60 line-clamp-2 mb-2">
                      {notice.content?.substring(0, 80)}
                      {notice.content?.length > 80 && '...'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-rich-black/50 dark:text-alice-blue/50">
                      <Icon name="clock" size={12} />
                      <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {notices.length > 0 && (
            <button
              onClick={() => navigate('/notice')}
              className="w-full py-3 text-center text-picton-blue hover:text-picton-blue-600 font-semibold transition-colors duration-200 bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl rounded-xl border border-rich-black/10 dark:border-alice-blue/10 hover:border-picton-blue/30 flex items-center justify-center gap-2"
            >
              <span>View All Notices</span>
              <Icon name="arrowRight" size={16} />
            </button>
          )}
        </div>
      </div>
      </motion.div>
      <Navigation />
    </>
  )
}
