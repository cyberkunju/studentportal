import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle'
import CustomSelect from '../../components/CustomSelect'
import AnimatedDatePicker from '../../components/AnimatedDatePicker'
import api from '../../services/api'

export default function AdminReports() {
  const navigate = useNavigate()
  const user = api.getCurrentUser()
  
  const [activeTab, setActiveTab] = useState('performance') // performance, financial, trends
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  
  // Performance Report State
  const [performanceFilters, setPerformanceFilters] = useState({
    semester: '',
    department: '',
    subject_id: ''
  })
  const [performanceData, setPerformanceData] = useState(null)
  const [subjects, setSubjects] = useState([])
  
  // Financial Report State
  const [financialFilters, setFinancialFilters] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    department: '',
    fee_type: ''
  })
  const [financialData, setFinancialData] = useState(null)
  
  // Trends Report State
  const [trendsFilters, setTrendsFilters] = useState({
    metric: 'performance',
    period: 'monthly'
  })
  const [trendsData, setTrendsData] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' })
    }, 3000)
  }

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login')
      return
    }
  }, [])

  const handleLogout = () => {
    api.logout()
    navigate('/login')
  }

  // Performance Report Functions
  const handlePerformanceFilterChange = (e) => {
    const { name, value } = e.target
    setPerformanceFilters(prev => ({ ...prev, [name]: value }))
    
    // Load subjects when department changes
    if (name === 'department' && value) {
      loadSubjects(value)
    }
  }

  const loadSubjects = async (department) => {
    try {
      const response = await api.getSubjects({ department })
      if (response.success) {
        setSubjects(response.data || [])
      }
    } catch (error) {
      console.error('Failed to load subjects:', error)
    }
  }

  const generatePerformanceReport = async () => {
    setLoading(true)
    try {
      const filters = {}
      if (performanceFilters.semester) filters.semester = performanceFilters.semester
      if (performanceFilters.department) filters.department = performanceFilters.department
      if (performanceFilters.subject_id) filters.subject_id = performanceFilters.subject_id
      
      const response = await api.getPerformanceReport(filters)
      
      if (response.success) {
        setPerformanceData(response.data)
        showToast('Performance report generated successfully!', 'success')
      } else {
        showToast(response.error || 'Failed to generate report', 'error')
      }
    } catch (error) {
      showToast(error.message || 'Failed to generate report', 'error')
    }
    setLoading(false)
  }

  // Financial Report Functions
  const handleFinancialFilterChange = (e) => {
    const { name, value } = e.target
    setFinancialFilters(prev => ({ ...prev, [name]: value }))
  }

  const generateFinancialReport = async () => {
    // Validate dates
    if (new Date(financialFilters.start_date) >= new Date(financialFilters.end_date)) {
      showToast('End date must be after start date', 'error')
      return
    }
    
    setLoading(true)
    try {
      const response = await api.getFinancialReport(financialFilters)
      
      if (response.success) {
        setFinancialData(response.data)
        showToast('Financial report generated successfully!', 'success')
      } else {
        showToast(response.error || 'Failed to generate report', 'error')
      }
    } catch (error) {
      showToast(error.message || 'Failed to generate report', 'error')
    }
    setLoading(false)
  }

  // Trends Report Functions
  const handleTrendsFilterChange = (e) => {
    const { name, value } = e.target
    setTrendsFilters(prev => ({ ...prev, [name]: value }))
  }

  const generateTrendsReport = async () => {
    setLoading(true)
    try {
      const response = await api.getTrendsReport(trendsFilters.metric, trendsFilters.period, {})
      
      if (response.success) {
        setTrendsData(response.data)
        showToast('Trends report generated successfully!', 'success')
      } else {
        showToast(response.error || 'Failed to generate report', 'error')
      }
    } catch (error) {
      showToast(error.message || 'Failed to generate report', 'error')
    }
    setLoading(false)
  }

  const getPassRateColor = (rate) => {
    if (rate > 75) return 'text-green-600 dark:text-green-400'
    if (rate >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getPassRateBgColor = (rate) => {
    if (rate > 75) return 'bg-green-500/10 dark:bg-green-500/20'
    if (rate >= 60) return 'bg-yellow-500/10 dark:bg-yellow-500/20'
    return 'bg-red-500/10 dark:bg-red-500/20'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const calculateCollectionRate = (collected, pending) => {
    const total = collected + pending
    return total > 0 ? ((collected / total) * 100).toFixed(2) : 0
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-24 px-4 py-6 max-w-7xl mx-auto"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white font-semibold`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="w-10 h-10 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all"
          >
            <i className="fas fa-arrow-left text-slate-800 dark:text-white"></i>
          </button>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Reports & Analytics</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-slate-700 dark:text-slate-300 font-medium">{user?.full_name}</span>
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white">
            <i className="fas fa-user-shield text-xl"></i>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="mb-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-lg">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('performance')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'performance'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-gray-700/30'
            }`}
          >
            <i className="fas fa-chart-line mr-2"></i>
            Performance
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'financial'
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-gray-700/30'
            }`}
          >
            <i className="fas fa-dollar-sign mr-2"></i>
            Financial
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'trends'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-gray-700/30'
            }`}
          >
            <i className="fas fa-chart-area mr-2"></i>
            Trends
          </button>
        </div>
      </div>

      {/* Performance Report Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Filters Panel */}
          <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              <i className="fas fa-filter mr-2"></i>
              Performance Report Filters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <CustomSelect
                name="semester"
                value={performanceFilters.semester}
                onChange={handlePerformanceFilterChange}
                options={[
                  { value: '', label: 'All Semesters' },
                  { value: '1', label: 'Semester 1' },
                  { value: '2', label: 'Semester 2' },
                  { value: '3', label: 'Semester 3' },
                  { value: '4', label: 'Semester 4' },
                  { value: '5', label: 'Semester 5' },
                  { value: '6', label: 'Semester 6' }
                ]}
                label="Semester"
                icon="fas fa-calendar"
              />
              
              <CustomSelect
                name="department"
                value={performanceFilters.department}
                onChange={handlePerformanceFilterChange}
                options={[
                  { value: '', label: 'All Departments' },
                  { value: 'BCA', label: 'BCA' },
                  { value: 'BBA', label: 'BBA' },
                  { value: 'B.Com', label: 'B.Com' }
                ]}
                label="Department"
                icon="fas fa-building"
              />
              
              <CustomSelect
                name="subject_id"
                value={performanceFilters.subject_id}
                onChange={handlePerformanceFilterChange}
                options={[
                  { value: '', label: 'All Subjects' },
                  ...subjects.map(s => ({ value: s.id.toString(), label: `${s.subject_code} - ${s.subject_name}` }))
                ]}
                label="Subject"
                icon="fas fa-book"
              />
              
              <div className="flex items-end">
                <button
                  onClick={generatePerformanceReport}
                  disabled={loading}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-chart-bar mr-2"></i>
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          {performanceData && (
            <div className="space-y-6">
              {/* Summary Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/90 font-medium">Average GPA</p>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <i className="fas fa-graduation-cap text-white"></i>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">
                    {performanceData.average_gpa?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-blue-100 text-sm">Out of 4.00</p>
                </div>

                <div className={`backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg ${
                  performanceData.pass_percentage > 75 
                    ? 'bg-gradient-to-br from-green-500 to-green-600' 
                    : performanceData.pass_percentage >= 60
                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                    : 'bg-gradient-to-br from-red-500 to-red-600'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/90 font-medium">Pass Percentage</p>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <i className="fas fa-check-circle text-white"></i>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">
                    {performanceData.pass_percentage?.toFixed(1) || '0.0'}%
                  </p>
                  <p className="text-white/80 text-sm">
                    {performanceData.pass_percentage > 75 ? 'Excellent' : performanceData.pass_percentage >= 60 ? 'Good' : 'Needs Improvement'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/90 font-medium">Total Students</p>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <i className="fas fa-users text-white"></i>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">
                    {performanceData.total_students || 0}
                  </p>
                  <p className="text-purple-100 text-sm">Analyzed</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/90 font-medium">Top Subject</p>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <i className="fas fa-trophy text-white"></i>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1 truncate">
                    {performanceData.subject_stats?.[0]?.subject_code || 'N/A'}
                  </p>
                  <p className="text-orange-100 text-sm truncate">
                    {performanceData.subject_stats?.[0]?.subject_name || 'No data'}
                  </p>
                </div>
              </div>

              {/* Subject-wise Performance Table */}
              {performanceData.subject_stats && performanceData.subject_stats.length > 0 && (
                <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    <i className="fas fa-table mr-2"></i>
                    Subject-wise Performance
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                          <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Subject Code</th>
                          <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Subject Name</th>
                          <th className="text-center py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Avg Marks</th>
                          <th className="text-center py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Pass Rate</th>
                          <th className="text-center py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Students</th>
                        </tr>
                      </thead>
                      <tbody>
                        {performanceData.subject_stats.map((subject, index) => (
                          <tr key={index} className="border-b border-slate-200 dark:border-slate-700 hover:bg-white/20 dark:hover:bg-gray-700/20 transition-all">
                            <td className="py-3 px-4 text-slate-800 dark:text-white font-medium">{subject.subject_code}</td>
                            <td className="py-3 px-4 text-slate-800 dark:text-white">{subject.subject_name}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-3 py-1 bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full font-semibold">
                                {subject.average_marks?.toFixed(1) || '0.0'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-3 py-1 rounded-full font-semibold ${getPassRateBgColor(subject.pass_rate)} ${getPassRateColor(subject.pass_rate)}`}>
                                {subject.pass_rate?.toFixed(1) || '0.0'}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center text-slate-800 dark:text-white font-medium">
                              {subject.student_count || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Department Comparison */}
              {performanceData.department_stats && performanceData.department_stats.length > 1 && (
                <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    <i className="fas fa-building mr-2"></i>
                    Department Comparison
                  </h3>
                  <div className="space-y-4">
                    {performanceData.department_stats.map((dept, index) => (
                      <div key={index} className="p-4 bg-white/20 dark:bg-gray-700/20 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-bold text-slate-800 dark:text-white">{dept.department}</h4>
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {dept.average_gpa?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600 dark:text-slate-400">Students</p>
                            <p className="font-semibold text-slate-800 dark:text-white">{dept.student_count || 0}</p>
                          </div>
                          <div>
                            <p className="text-slate-600 dark:text-slate-400">Pass Rate</p>
                            <p className={`font-semibold ${getPassRateColor(dept.pass_rate)}`}>
                              {dept.pass_rate?.toFixed(1) || '0.0'}%
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600 dark:text-slate-400">Avg Marks</p>
                            <p className="font-semibold text-slate-800 dark:text-white">
                              {dept.average_marks?.toFixed(1) || '0.0'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Data State */}
          {!performanceData && !loading && (
            <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-12 border border-white/20 shadow-lg text-center">
              <i className="fas fa-chart-line text-6xl text-slate-400 mb-4"></i>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Select filters and click "Generate Report" to view performance analytics
              </p>
            </div>
          )}
        </div>
      )}

      {/* Financial Report Tab */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Filters Panel */}
          <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              <i className="fas fa-filter mr-2"></i>
              Financial Report Filters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <AnimatedDatePicker
                label="Start Date"
                name="start_date"
                value={financialFilters.start_date}
                onChange={handleFinancialFilterChange}
                icon="fas fa-calendar-day"
                borderColor="green"
              />
              
              <AnimatedDatePicker
                label="End Date"
                name="end_date"
                value={financialFilters.end_date}
                onChange={handleFinancialFilterChange}
                icon="fas fa-calendar-day"
                borderColor="green"
                minDate={financialFilters.start_date}
              />
              
              <CustomSelect
                name="department"
                value={financialFilters.department}
                onChange={handleFinancialFilterChange}
                options={[
                  { value: '', label: 'All Departments' },
                  { value: 'BCA', label: 'BCA' },
                  { value: 'BBA', label: 'BBA' },
                  { value: 'B.Com', label: 'B.Com' }
                ]}
                label="Department"
                icon="fas fa-building"
              />
              
              <CustomSelect
                name="fee_type"
                value={financialFilters.fee_type}
                onChange={handleFinancialFilterChange}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'Tuition Fee', label: 'Tuition Fee' },
                  { value: 'Lab Fee', label: 'Lab Fee' },
                  { value: 'Library Fee', label: 'Library Fee' },
                  { value: 'Exam Fee', label: 'Exam Fee' }
                ]}
                label="Fee Type"
                icon="fas fa-tag"
              />
              
              <div className="flex items-end">
                <button
                  onClick={generateFinancialReport}
                  disabled={loading}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-chart-bar mr-2"></i>
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          {financialData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/90 font-medium">Total Collected</p>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <i className="fas fa-check-circle text-white"></i>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {formatCurrency(financialData.total_collected || 0)}
                  </p>
                  <p className="text-green-100 text-sm">Received</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/90 font-medium">Total Pending</p>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <i className="fas fa-clock text-white"></i>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {formatCurrency(financialData.total_pending || 0)}
                  </p>
                  <p className="text-orange-100 text-sm">Outstanding</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/90 font-medium">Late Fines</p>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <i className="fas fa-exclamation-triangle text-white"></i>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {formatCurrency(financialData.total_late_fines || 0)}
                  </p>
                  <p className="text-blue-100 text-sm">Collected</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/90 font-medium">Collection Rate</p>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <i className="fas fa-percentage text-white"></i>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {calculateCollectionRate(financialData.total_collected || 0, financialData.total_pending || 0)}%
                  </p>
                  <p className="text-purple-100 text-sm">Success Rate</p>
                </div>
              </div>

              {/* Fee Type Breakdown Table */}
              {financialData.fee_breakdown && financialData.fee_breakdown.length > 0 && (
                <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    <i className="fas fa-table mr-2"></i>
                    Fee Type Breakdown
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                          <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Fee Type</th>
                          <th className="text-right py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Total Due</th>
                          <th className="text-right py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Collected</th>
                          <th className="text-right py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Pending</th>
                          <th className="text-center py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Collection %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {financialData.fee_breakdown.map((fee, index) => {
                          const totalDue = (fee.collected || 0) + (fee.pending || 0)
                          const collectionPercent = totalDue > 0 ? ((fee.collected / totalDue) * 100).toFixed(1) : 0
                          
                          return (
                            <tr key={index} className="border-b border-slate-200 dark:border-slate-700 hover:bg-white/20 dark:hover:bg-gray-700/20 transition-all">
                              <td className="py-3 px-4 text-slate-800 dark:text-white font-medium">{fee.fee_type}</td>
                              <td className="py-3 px-4 text-right text-slate-800 dark:text-white">
                                {formatCurrency(totalDue)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="text-green-600 dark:text-green-400 font-semibold">
                                  {formatCurrency(fee.collected || 0)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="text-orange-600 dark:text-orange-400 font-semibold">
                                  {formatCurrency(fee.pending || 0)}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="font-semibold text-slate-800 dark:text-white">{collectionPercent}%</span>
                                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full transition-all"
                                      style={{ width: `${collectionPercent}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                        {/* Totals Row */}
                        <tr className="bg-slate-100 dark:bg-slate-800 font-bold">
                          <td className="py-3 px-4 text-slate-800 dark:text-white">TOTAL</td>
                          <td className="py-3 px-4 text-right text-slate-800 dark:text-white">
                            {formatCurrency((financialData.total_collected || 0) + (financialData.total_pending || 0))}
                          </td>
                          <td className="py-3 px-4 text-right text-green-600 dark:text-green-400">
                            {formatCurrency(financialData.total_collected || 0)}
                          </td>
                          <td className="py-3 px-4 text-right text-orange-600 dark:text-orange-400">
                            {formatCurrency(financialData.total_pending || 0)}
                          </td>
                          <td className="py-3 px-4 text-center text-slate-800 dark:text-white">
                            {calculateCollectionRate(financialData.total_collected || 0, financialData.total_pending || 0)}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Timeline */}
              {financialData.timeline && financialData.timeline.length > 0 && (
                <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    <i className="fas fa-chart-line mr-2"></i>
                    Payment Timeline
                  </h3>
                  <div className="space-y-2">
                    {financialData.timeline.map((entry, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-white/20 dark:bg-gray-700/20 rounded-lg">
                        <div className="flex-shrink-0 w-24 text-sm text-slate-600 dark:text-slate-400">
                          {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                                style={{ width: `${Math.min((entry.amount / Math.max(...financialData.timeline.map(t => t.amount))) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-slate-800 dark:text-white w-32 text-right">
                              {formatCurrency(entry.amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Data State */}
          {!financialData && !loading && (
            <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-12 border border-white/20 shadow-lg text-center">
              <i className="fas fa-dollar-sign text-6xl text-slate-400 mb-4"></i>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Select date range and filters, then click "Generate Report" to view financial analytics
              </p>
            </div>
          )}
        </div>
      )}

      {/* Trends Report Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Filters Panel */}
          <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              <i className="fas fa-filter mr-2"></i>
              Trends Analytics Filters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomSelect
                name="metric"
                value={trendsFilters.metric}
                onChange={handleTrendsFilterChange}
                options={[
                  { value: 'attendance', label: 'Attendance' },
                  { value: 'performance', label: 'Performance' },
                  { value: 'payments', label: 'Payments' }
                ]}
                label="Metric"
                icon="fas fa-chart-area"
              />
              
              <CustomSelect
                name="period"
                value={trendsFilters.period}
                onChange={handleTrendsFilterChange}
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'semester', label: 'Semester' }
                ]}
                label="Period"
                icon="fas fa-calendar"
              />
              
              <div className="flex items-end">
                <button
                  onClick={generateTrendsReport}
                  disabled={loading}
                  className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-chart-bar mr-2"></i>
                      Generate Trends
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          {trendsData && (
            <div className="space-y-6">
              {/* Percentage Change Indicators */}
              {trendsData.percentage_changes && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-700 dark:text-slate-300 font-medium">Current Period</p>
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <i className="fas fa-calendar-day text-blue-500"></i>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
                      {trendsData.percentage_changes.current_value?.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {trendsFilters.metric === 'attendance' ? 'Avg Attendance %' : 
                       trendsFilters.metric === 'performance' ? 'Avg GPA' : 'Total Collected'}
                    </p>
                  </div>

                  <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-700 dark:text-slate-300 font-medium">Previous Period</p>
                      <div className="w-10 h-10 rounded-full bg-slate-500/20 flex items-center justify-center">
                        <i className="fas fa-history text-slate-500"></i>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
                      {trendsData.percentage_changes.previous_value?.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Last period value</p>
                  </div>

                  <div className={`backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg ${
                    (trendsData.percentage_changes.change || 0) >= 0
                      ? 'bg-gradient-to-br from-green-500 to-green-600'
                      : 'bg-gradient-to-br from-red-500 to-red-600'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/90 font-medium">Change</p>
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <i className={`fas fa-arrow-${(trendsData.percentage_changes.change || 0) >= 0 ? 'up' : 'down'} text-white`}></i>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                      {(trendsData.percentage_changes.change || 0) >= 0 ? '+' : ''}
                      {trendsData.percentage_changes.change?.toFixed(1) || '0.0'}%
                    </p>
                    <p className="text-white/80 text-sm">
                      {(trendsData.percentage_changes.change || 0) >= 0 ? 'Improvement' : 'Decline'}
                    </p>
                  </div>
                </div>
              )}

              {/* Trend Chart */}
              {trendsData.trend_data && trendsData.trend_data.length > 0 && (
                <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    <i className="fas fa-chart-line mr-2"></i>
                    Trend Over Time
                  </h3>
                  <div className="space-y-3">
                    {trendsData.trend_data.map((point, index) => {
                      const maxValue = Math.max(...trendsData.trend_data.map(p => p.value))
                      const percentage = (point.value / maxValue) * 100
                      
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-32 text-sm font-medium text-slate-700 dark:text-slate-300">
                            {point.period}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-4 rounded-full transition-all flex items-center justify-end pr-2"
                                  style={{ width: `${percentage}%` }}
                                >
                                  <span className="text-xs font-semibold text-white">
                                    {point.value?.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-slate-800 dark:text-white w-16 text-right">
                                {point.value?.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Insights Panel */}
              {trendsData.insights && trendsData.insights.length > 0 && (
                <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    <i className="fas fa-lightbulb mr-2"></i>
                    Key Insights
                  </h3>
                  <div className="space-y-3">
                    {trendsData.insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <i className="fas fa-info-circle text-blue-500"></i>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 flex-1">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Period Comparison Table */}
              {trendsData.period_comparison && trendsData.period_comparison.length > 0 && (
                <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    <i className="fas fa-table mr-2"></i>
                    Period Comparison
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                          <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Period</th>
                          <th className="text-center py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Value</th>
                          <th className="text-center py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Change %</th>
                          <th className="text-center py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trendsData.period_comparison.map((period, index) => {
                          const isBest = period.is_best
                          const isWorst = period.is_worst
                          
                          return (
                            <tr key={index} className={`border-b border-slate-200 dark:border-slate-700 hover:bg-white/20 dark:hover:bg-gray-700/20 transition-all ${
                              isBest ? 'bg-green-500/10 dark:bg-green-500/20' : 
                              isWorst ? 'bg-red-500/10 dark:bg-red-500/20' : ''
                            }`}>
                              <td className="py-3 px-4 text-slate-800 dark:text-white font-medium">
                                {period.period}
                                {isBest && <i className="fas fa-trophy text-yellow-500 ml-2"></i>}
                                {isWorst && <i className="fas fa-exclamation-triangle text-red-500 ml-2"></i>}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full font-semibold">
                                  {period.value?.toFixed(1)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-3 py-1 rounded-full font-semibold ${
                                  (period.change || 0) >= 0
                                    ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                                    : 'bg-red-500/20 text-red-700 dark:text-red-300'
                                }`}>
                                  {(period.change || 0) >= 0 ? '+' : ''}{period.change?.toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {isBest && (
                                  <span className="px-3 py-1 bg-green-500 text-white rounded-full font-semibold text-sm">
                                    Best
                                  </span>
                                )}
                                {isWorst && (
                                  <span className="px-3 py-1 bg-red-500 text-white rounded-full font-semibold text-sm">
                                    Worst
                                  </span>
                                )}
                                {!isBest && !isWorst && (
                                  <span className="text-slate-600 dark:text-slate-400">—</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Data State */}
          {!trendsData && !loading && (
            <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-12 border border-white/20 shadow-lg text-center">
              <i className="fas fa-chart-area text-6xl text-slate-400 mb-4"></i>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Select metric and period, then click "Generate Trends" to view analytics
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
