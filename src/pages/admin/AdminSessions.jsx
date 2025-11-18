import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle'
import AnimatedDatePicker from '../../components/AnimatedDatePicker'
import api from '../../services/api'

export default function AdminSessions() {
  const navigate = useNavigate()
  const user = api.getCurrentUser()
  
  const [sessions, setSessions] = useState([])
  const [semesters, setSemesters] = useState({}) // Store semesters by session_id
  const [expandedSessions, setExpandedSessions] = useState({}) // Track which sessions are expanded
  const [showSemesterForm, setShowSemesterForm] = useState({}) // Track which session's form is shown
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showActivateModal, setShowActivateModal] = useState(false)
  const [sessionToActivate, setSessionToActivate] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  
  // Form data
  const [formData, setFormData] = useState({
    session_name: '',
    start_year: new Date().getFullYear(),
    end_year: new Date().getFullYear() + 1,
    start_date: '',
    end_date: ''
  })

  // Semester form data
  const [semesterFormData, setSemesterFormData] = useState({})

  const [formErrors, setFormErrors] = useState({})
  const [semesterFormErrors, setSemesterFormErrors] = useState({})

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
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const response = await api.listSessions()
      if (response.success) {
        setSessions(response.data.sessions || [])
        // Fetch all semesters after loading sessions
        await fetchAllSemesters()
      } else {
        showToast(response.error || 'Failed to load sessions', 'error')
      }
    } catch (error) {
      showToast('Failed to load sessions', 'error')
    }
    setLoading(false)
  }

  const fetchAllSemesters = async () => {
    try {
      const response = await api.listSemesters()
      if (response.success) {
        // Response contains semesters_by_session object
        setSemesters(response.data.semesters_by_session || {})
      }
    } catch (error) {
      console.error('Failed to load semesters:', error)
      // Don't show error toast for semesters, just log it
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    
    // Validate session name
    if (!formData.session_name.trim()) {
      errors.session_name = 'Session name is required'
    }
    
    // Validate dates
    if (!formData.start_date) {
      errors.start_date = 'Start date is required'
    }
    if (!formData.end_date) {
      errors.end_date = 'End date is required'
    }
    
    // Validate start_date < end_date
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      
      if (startDate >= endDate) {
        errors.end_date = 'End date must be after start date'
      }
    }
    
    // Validate years match dates
    if (formData.start_date) {
      const startYear = new Date(formData.start_date).getFullYear()
      if (startYear !== parseInt(formData.start_year)) {
        errors.start_year = 'Start year must match start date year'
      }
    }
    
    if (formData.end_date) {
      const endYear = new Date(formData.end_date).getFullYear()
      if (endYear !== parseInt(formData.end_year)) {
        errors.end_year = 'End year must match end date year'
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showToast('Please fix the form errors', 'error')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await api.createSession(formData)
      
      if (response.success) {
        showToast('Session created successfully!', 'success')
        setShowAddForm(false)
        setFormData({
          session_name: '',
          start_year: new Date().getFullYear(),
          end_year: new Date().getFullYear() + 1,
          start_date: '',
          end_date: ''
        })
        setFormErrors({})
        fetchSessions()
      } else {
        showToast(response.error || 'Failed to create session', 'error')
      }
    } catch (error) {
      showToast(error.message || 'Failed to create session', 'error')
    }
    
    setLoading(false)
  }

  const handleActivateClick = (session) => {
    setSessionToActivate(session)
    setShowActivateModal(true)
  }

  const confirmActivate = async () => {
    if (!sessionToActivate) return
    
    setLoading(true)
    setShowActivateModal(false)
    
    try {
      const response = await api.activateSession(sessionToActivate.id)
      
      if (response.success) {
        showToast('Session activated successfully!', 'success')
        fetchSessions()
      } else {
        showToast(response.error || 'Failed to activate session', 'error')
      }
    } catch (error) {
      showToast(error.message || 'Failed to activate session', 'error')
    }
    
    setLoading(false)
    setSessionToActivate(null)
  }

  const cancelActivate = () => {
    setShowActivateModal(false)
    setSessionToActivate(null)
  }

  const handleLogout = () => {
    api.logout()
    navigate('/login')
  }

  // ==================== Semester Management Functions ====================

  const toggleSessionExpand = (sessionId) => {
    const isExpanding = !expandedSessions[sessionId]
    
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: isExpanding
    }))
    
    // Fetch semesters when expanding if not already loaded
    if (isExpanding && !semesters[sessionId]) {
      fetchSemestersForSession(sessionId)
    }
  }

  const toggleSemesterForm = (sessionId) => {
    setShowSemesterForm(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }))
    
    // Initialize form data for this session if not exists
    if (!semesterFormData[sessionId]) {
      const session = sessions.find(s => s.id === sessionId)
      setSemesterFormData(prev => ({
        ...prev,
        [sessionId]: {
          session_id: sessionId,
          semester_number: 1,
          start_date: session?.start_date || '',
          end_date: session?.end_date || ''
        }
      }))
    }
  }

  const handleSemesterInputChange = (sessionId, e) => {
    const { name, value } = e.target
    setSemesterFormData(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        [name]: value
      }
    }))
    
    // Clear error for this field
    if (semesterFormErrors[sessionId]?.[name]) {
      setSemesterFormErrors(prev => ({
        ...prev,
        [sessionId]: {
          ...prev[sessionId],
          [name]: ''
        }
      }))
    }
  }

  const validateSemesterForm = (sessionId) => {
    const data = semesterFormData[sessionId]
    const session = sessions.find(s => s.id === sessionId)
    const errors = {}
    
    // Validate semester number
    if (!data.semester_number) {
      errors.semester_number = 'Semester number is required'
    } else if (data.semester_number < 1 || data.semester_number > 6) {
      errors.semester_number = 'Semester number must be between 1 and 6'
    }
    
    // Check if semester number already exists for this session
    const existingSemesters = semesters[sessionId] || []
    if (existingSemesters.some(sem => sem.semester_number === parseInt(data.semester_number))) {
      errors.semester_number = 'This semester number already exists for this session'
    }
    
    // Validate dates
    if (!data.start_date) {
      errors.start_date = 'Start date is required'
    }
    if (!data.end_date) {
      errors.end_date = 'End date is required'
    }
    
    // Validate start_date < end_date
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date)
      const endDate = new Date(data.end_date)
      
      if (startDate >= endDate) {
        errors.end_date = 'End date must be after start date'
      }
    }
    
    // Validate dates fall within session dates
    if (session && data.start_date) {
      const semesterStart = new Date(data.start_date)
      const sessionStart = new Date(session.start_date)
      
      if (semesterStart < sessionStart) {
        errors.start_date = 'Semester start date must be on or after session start date'
      }
    }
    
    if (session && data.end_date) {
      const semesterEnd = new Date(data.end_date)
      const sessionEnd = new Date(session.end_date)
      
      if (semesterEnd > sessionEnd) {
        errors.end_date = 'Semester end date must be on or before session end date'
      }
    }
    
    setSemesterFormErrors(prev => ({
      ...prev,
      [sessionId]: errors
    }))
    
    return Object.keys(errors).length === 0
  }

  const handleSemesterSubmit = async (sessionId, e) => {
    e.preventDefault()
    
    if (!validateSemesterForm(sessionId)) {
      showToast('Please fix the form errors', 'error')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await api.createSemester(semesterFormData[sessionId])
      
      if (response.success) {
        showToast('Semester created successfully!', 'success')
        setShowSemesterForm(prev => ({ ...prev, [sessionId]: false }))
        
        // Reset form data for this session
        const session = sessions.find(s => s.id === sessionId)
        setSemesterFormData(prev => ({
          ...prev,
          [sessionId]: {
            session_id: sessionId,
            semester_number: 1,
            start_date: session?.start_date || '',
            end_date: session?.end_date || ''
          }
        }))
        setSemesterFormErrors(prev => ({ ...prev, [sessionId]: {} }))
        
        // Refresh semesters for this session
        fetchSemestersForSession(sessionId)
      } else {
        showToast(response.error || 'Failed to create semester', 'error')
      }
    } catch (error) {
      showToast(error.message || 'Failed to create semester', 'error')
    }
    
    setLoading(false)
  }

  const fetchSemestersForSession = async (sessionId) => {
    try {
      const response = await api.listSemesters(sessionId)
      if (response.success) {
        // Update semesters for this specific session
        setSemesters(prev => ({
          ...prev,
          [sessionId]: response.data.semesters || []
        }))
      }
    } catch (error) {
      console.error('Failed to load semesters for session:', error)
    }
  }

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} days`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''}`
    } else {
      const years = Math.floor(diffDays / 365)
      const remainingMonths = Math.floor((diffDays % 365) / 30)
      return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`
    }
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="w-10 h-10 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all"
          >
            <i className="fas fa-arrow-left text-slate-800 dark:text-white"></i>
          </button>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Academic Sessions</h1>
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

      {/* Add Session Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all"
        >
          <i className={`fas ${showAddForm ? 'fa-times' : 'fa-plus'}`}></i>
          {showAddForm ? 'Cancel' : 'Create New Session'}
        </button>
      </div>

      {/* Add Session Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg mb-6"
          >
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              Create New Academic Session
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Session Name */}
                <div className="md:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                    <i className="fas fa-calendar-alt mr-2"></i>
                    Session Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="session_name"
                    value={formData.session_name}
                    onChange={handleInputChange}
                    placeholder="e.g., 2024-2025"
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      formErrors.session_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white/50 dark:bg-gray-700/50 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all`}
                  />
                  {formErrors.session_name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.session_name}</p>
                  )}
                </div>

                {/* Start Year */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                    <i className="fas fa-calendar-check mr-2"></i>
                    Start Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="start_year"
                    value={formData.start_year}
                    onChange={handleInputChange}
                    min="2020"
                    max="2050"
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      formErrors.start_year ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white/50 dark:bg-gray-700/50 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all`}
                  />
                  {formErrors.start_year && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.start_year}</p>
                  )}
                </div>

                {/* End Year */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                    <i className="fas fa-calendar-times mr-2"></i>
                    End Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="end_year"
                    value={formData.end_year}
                    onChange={handleInputChange}
                    min="2020"
                    max="2050"
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      formErrors.end_year ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white/50 dark:bg-gray-700/50 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all`}
                  />
                  {formErrors.end_year && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.end_year}</p>
                  )}
                </div>

                {/* Start Date */}
                <div>
                  <AnimatedDatePicker
                    label={<>Start Date <span className="text-red-500">*</span></>}
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    icon="fas fa-calendar-day"
                    borderColor="teal"
                  />
                  {formErrors.start_date && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.start_date}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <AnimatedDatePicker
                    label={<>End Date <span className="text-red-500">*</span></>}
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    icon="fas fa-calendar-day"
                    borderColor="orange"
                    minDate={formData.start_date}
                    referenceDates={formData.start_date ? [{ date: formData.start_date, color: 'teal' }] : []}
                  />
                  {formErrors.end_date && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.end_date}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Creating Session...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        Create Session
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sessions List */}
      <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
          All Academic Sessions
        </h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="text-2xl text-slate-800 dark:text-white">Loading...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-calendar-alt text-6xl text-slate-400 mb-4"></i>
            <p className="text-slate-600 dark:text-slate-400">
              No sessions found. Create your first academic session!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                className={`rounded-xl border-2 transition-all ${
                  session.is_active 
                    ? 'bg-green-500/10 dark:bg-green-500/20 border-green-400 dark:border-green-600' 
                    : 'bg-white/20 dark:bg-gray-700/20 border-slate-300 dark:border-slate-600'
                }`}
              >
                {/* Session Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleSessionExpand(session.id)}
                      className="w-10 h-10 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all"
                    >
                      <i className={`fas fa-chevron-${expandedSessions[session.id] ? 'down' : 'right'} text-slate-800 dark:text-white`}></i>
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                          {session.session_name}
                        </h3>
                        {session.is_active && (
                          <span className="px-3 py-1 bg-green-500 text-white rounded-full font-semibold text-xs inline-flex items-center gap-1">
                            <i className="fas fa-check-circle"></i>
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span>
                          <i className="fas fa-calendar-alt mr-1"></i>
                          {session.start_year} - {session.end_year}
                        </span>
                        <span>
                          <i className="fas fa-clock mr-1"></i>
                          {new Date(session.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' → '}
                          {new Date(session.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!session.is_active && (
                      <button 
                        onClick={() => handleActivateClick(session)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                      >
                        <i className="fas fa-power-off mr-2"></i>
                        Set Active
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Content - Semesters */}
                <AnimatePresence>
                  {expandedSessions[session.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-300 dark:border-slate-600"
                    >
                      <div className="p-4 bg-white/10 dark:bg-gray-800/10">
                        {/* Add Semester Button */}
                        <div className="mb-4">
                          <button
                            onClick={() => toggleSemesterForm(session.id)}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold shadow-md flex items-center gap-2 transition-all"
                          >
                            <i className={`fas ${showSemesterForm[session.id] ? 'fa-times' : 'fa-plus'}`}></i>
                            {showSemesterForm[session.id] ? 'Cancel' : 'Add Semester'}
                          </button>
                        </div>

                        {/* Semester Form */}
                        <AnimatePresence>
                          {showSemesterForm[session.id] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-white/40 dark:bg-gray-700/40 rounded-xl p-4 mb-4 border border-purple-300 dark:border-purple-700"
                            >
                              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                                <i className="fas fa-calendar-plus mr-2"></i>
                                Create New Semester
                              </h4>
                              <form onSubmit={(e) => handleSemesterSubmit(session.id, e)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {/* Semester Number */}
                                  <div>
                                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                                      <i className="fas fa-hashtag mr-2"></i>
                                      Semester Number <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                      name="semester_number"
                                      value={semesterFormData[session.id]?.semester_number || 1}
                                      onChange={(e) => handleSemesterInputChange(session.id, e)}
                                      required
                                      className={`w-full px-4 py-3 rounded-lg border ${
                                        semesterFormErrors[session.id]?.semester_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                      } bg-white/50 dark:bg-gray-700/50 text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 focus:bg-white/70 dark:focus:bg-gray-700/70 transition-all`}
                                    >
                                      {[1, 2, 3, 4, 5, 6].map(num => (
                                        <option key={num} value={num}>Semester {num}</option>
                                      ))}
                                    </select>
                                    {semesterFormErrors[session.id]?.semester_number && (
                                      <p className="text-red-500 text-sm mt-1">{semesterFormErrors[session.id].semester_number}</p>
                                    )}
                                  </div>

                                  {/* Start Date */}
                                  <div>
                                    <AnimatedDatePicker
                                      label={<>Start Date <span className="text-red-500">*</span></>}
                                      name="start_date"
                                      value={semesterFormData[session.id]?.start_date || ''}
                                      onChange={(e) => handleSemesterInputChange(session.id, e)}
                                      icon="fas fa-calendar-day"
                                      borderColor="purple"
                                      minDate={session.start_date}
                                      maxDate={session.end_date}
                                      referenceDates={[
                                        { date: session.start_date, color: 'teal', label: 'Session Start' },
                                        { date: session.end_date, color: 'orange', label: 'Session End' }
                                      ]}
                                    />
                                    {semesterFormErrors[session.id]?.start_date && (
                                      <p className="text-red-500 text-sm mt-1">{semesterFormErrors[session.id].start_date}</p>
                                    )}
                                  </div>

                                  {/* End Date */}
                                  <div>
                                    <AnimatedDatePicker
                                      label={<>End Date <span className="text-red-500">*</span></>}
                                      name="end_date"
                                      value={semesterFormData[session.id]?.end_date || ''}
                                      onChange={(e) => handleSemesterInputChange(session.id, e)}
                                      icon="fas fa-calendar-day"
                                      borderColor="orange"
                                      minDate={semesterFormData[session.id]?.start_date || session.start_date}
                                      maxDate={session.end_date}
                                      referenceDates={[
                                        { date: semesterFormData[session.id]?.start_date, color: 'purple', label: 'Semester Start' },
                                        { date: session.end_date, color: 'orange', label: 'Session End' }
                                      ]}
                                    />
                                    {semesterFormErrors[session.id]?.end_date && (
                                      <p className="text-red-500 text-sm mt-1">{semesterFormErrors[session.id].end_date}</p>
                                    )}
                                  </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                  type="submit"
                                  disabled={loading}
                                  className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {loading ? (
                                    <>
                                      <i className="fas fa-spinner fa-spin mr-2"></i>
                                      Creating Semester...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-save mr-2"></i>
                                      Create Semester
                                    </>
                                  )}
                                </button>
                              </form>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Semesters List */}
                        <div className="space-y-2">
                          {semesters[session.id] && semesters[session.id].length > 0 ? (
                            semesters[session.id]
                              .sort((a, b) => a.semester_number - b.semester_number)
                              .map((semester) => (
                                <div 
                                  key={semester.id}
                                  className="bg-white/30 dark:bg-gray-700/30 rounded-lg p-3 border border-slate-300 dark:border-slate-600 flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white font-bold">
                                      {semester.semester_number}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-slate-800 dark:text-white">
                                        Semester {semester.semester_number}
                                      </div>
                                      <div className="text-sm text-slate-600 dark:text-slate-400">
                                        {new Date(semester.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        {' → '}
                                        {new Date(semester.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-sm text-slate-600 dark:text-slate-400">
                                    <i className="fas fa-clock mr-1"></i>
                                    {calculateDuration(semester.start_date, semester.end_date)}
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                              <i className="fas fa-calendar-times text-4xl mb-2 opacity-50"></i>
                              <p>No semesters created yet. Click "Add Semester" to create one.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activate Confirmation Modal */}
      {showActivateModal && sessionToActivate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-blue-200 dark:border-blue-900"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                <i className="fas fa-power-off text-3xl text-blue-600 dark:text-blue-400"></i>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                Activate Session
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-2">
                Are you sure you want to activate <strong>{sessionToActivate.session_name}</strong>?
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400 mb-6">
                This will deactivate the currently active session.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelActivate}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-800 dark:text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmActivate}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  <i className="fas fa-check mr-2"></i>
                  Activate
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border-2 flex items-center gap-3 max-w-md ${
            toast.type === 'success' 
              ? 'bg-green-500/90 border-green-400 text-white' 
              : 'bg-red-500/90 border-red-400 text-white'
          }`}
        >
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            toast.type === 'success' 
              ? 'bg-white/20' 
              : 'bg-white/20'
          }`}>
            <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-xl`}></i>
          </div>
          <p className="font-semibold flex-1">{toast.message}</p>
          <button
            onClick={() => setToast({ show: false, message: '', type: '' })}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
