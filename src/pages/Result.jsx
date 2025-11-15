import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import ThemeToggle from '../components/ThemeToggle'
import api from '../services/api'

export default function Result() {
  const navigate = useNavigate()
  const [marks, setMarks] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSemester, setSelectedSemester] = useState(null)
  const user = api.getCurrentUser()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    fetchMarks(user.semester || null)
  }, [])

  const fetchMarks = async (semester) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await api.getMarks(semester)
      
      if (result.success && result.data) {
        setMarks(result.data.marks || [])
        setSummary(result.data.summary || {})
      } else {
        setError(result.message || 'Failed to fetch marks')
      }
    } catch (err) {
      console.error('Error fetching marks:', err)
      setError(err.message || 'Failed to fetch marks')
    } finally {
      setLoading(false)
    }
  }

  const handleSemesterChange = (semester) => {
    setSelectedSemester(semester)
    fetchMarks(semester)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen pb-24 px-4 py-6 max-w-6xl mx-auto"
      >
      {/* Top Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Academic Results</h1>
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

      <p className="text-slate-600 dark:text-slate-400 mb-4">Your semester performance and grades</p>

      {/* Semester Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => handleSemesterChange(null)}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            selectedSemester === null
              ? 'bg-indigo-500 text-white'
              : 'bg-white/30 dark:bg-gray-800/30 text-slate-700 dark:text-slate-300 hover:bg-indigo-500/20'
          }`}
        >
          Current
        </button>
        {[1, 2, 3, 4, 5, 6].map((sem) => (
          <button
            key={sem}
            onClick={() => handleSemesterChange(sem)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedSemester === sem
                ? 'bg-indigo-500 text-white'
                : 'bg-white/30 dark:bg-gray-800/30 text-slate-700 dark:text-slate-300 hover:bg-indigo-500/20'
            }`}
          >
            Sem {sem}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-2xl text-slate-800 dark:text-white">Loading results...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-xl text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={() => fetchMarks(selectedSemester)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* GPA/CGPA Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
              <p className="text-indigo-100 mb-2">Semester GPA</p>
              <h2 className="text-5xl font-bold">{summary?.gpa?.toFixed(2) || '0.00'}</h2>
              <p className="text-indigo-100 mt-2">Semester {selectedSemester || user?.semester || 'Current'}</p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
              <p className="text-purple-100 mb-2">Cumulative CGPA</p>
              <h2 className="text-5xl font-bold">{summary?.cgpa?.toFixed(2) || '0.00'}</h2>
              <p className="text-purple-100 mt-2">Overall Performance</p>
            </div>

            <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-xl">
              <p className="text-pink-100 mb-2">Total Credits</p>
              <h2 className="text-5xl font-bold">{summary?.total_credits || 0}</h2>
              <p className="text-pink-100 mt-2">{summary?.total_subjects || 0} Subjects</p>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Course Results</h2>
            
            {marks.length === 0 ? (
              <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                No marks available for this semester
              </div>
            ) : (
              <div className="space-y-4">
                {marks.map((mark, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30 transition-all gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-semibold">
                          {mark.subject_code}
                        </span>
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          {mark.subject_name}
                        </h3>
                      </div>
                      <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span>Credits: {mark.credit_hours}</span>
                        <span>CP: {mark.credit_points?.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Internal</p>
                        <p className="text-lg font-bold text-slate-800 dark:text-white">{mark.internal_marks}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">External</p>
                        <p className="text-lg font-bold text-slate-800 dark:text-white">{mark.external_marks}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total</p>
                        <p className="text-lg font-bold text-slate-800 dark:text-white">{mark.total_marks}/100</p>
                      </div>
                      <div className="text-center min-w-[80px]">
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Grade</p>
                        <div className="flex flex-col">
                          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {mark.letter_grade}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            GP: {mark.grade_point?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {marks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <button 
                  onClick={async () => {
                    try {
                      await api.downloadPerformanceReport(selectedSemester)
                      alert('✅ Performance Report downloaded successfully!')
                    } catch (error) {
                      alert(`❌ Failed to download report: ${error.message}`)
                    }
                  }}
                  className="py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                >
                  📥 Download PDF Report
                </button>
                <button 
                  onClick={() => window.print()}
                  className="py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                >
                  🖨️ Print Transcript
                </button>
              </div>
            )}
          </div>
        </>
      )}
      </motion.div>
      <Navigation />
    </>
  )
}
