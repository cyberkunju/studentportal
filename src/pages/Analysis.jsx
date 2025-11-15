import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import ThemeToggle from '../components/ThemeToggle'
import api from '../services/api'

export default function Analysis() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentSemesterData, setCurrentSemesterData] = useState(null)
  const [allSemestersData, setAllSemestersData] = useState([])
  const [subjectPerformance, setSubjectPerformance] = useState([])
  const user = api.getCurrentUser()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    fetchAnalysisData()
  }, [])

  const fetchAnalysisData = async () => {
    try {
      setLoading(true)
      setError(null)

      const currentResult = await api.getMarks()
      
      if (currentResult.success && currentResult.data) {
        setCurrentSemesterData(currentResult.data)
        
        const marks = currentResult.data.marks || []
        const subjectPerf = marks.map(mark => ({
          name: mark.subject_name,
          code: mark.subject_code,
          percentage: mark.total_marks,
          grade: mark.letter_grade,
          gp: mark.grade_point
        }))
        setSubjectPerformance(subjectPerf)
      }

      const semesters = []
      for (let sem = 1; sem <= 6; sem++) {
        const result = await api.getMarks(sem)
        if (result.success && result.data && result.data.marks && result.data.marks.length > 0) {
          semesters.push({
            semester: sem,
            gpa: result.data.summary?.gpa || 0,
            subjects: result.data.marks?.length || 0
          })
        }
      }
      setAllSemestersData(semesters)

    } catch (err) {
      console.error('Error fetching analysis data:', err)
      setError(err.message || 'Failed to fetch analysis data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-slate-800 dark:text-white">Loading analysis...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={fetchAnalysisData}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const summary = currentSemesterData?.summary || {}

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
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Performance Analysis</h1>
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

      <p className="text-slate-600 dark:text-slate-400 mb-8">Track your academic progress</p>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => navigate('/result')}
          className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-blue-500/10 dark:hover:bg-blue-500/20 transition-all cursor-pointer"
        >
          <div className="text-blue-500 mb-2">
            <div className="text-3xl">📊</div>
          </div>
          <h3 className="text-sm text-slate-600 dark:text-slate-400 mb-1">Current GPA</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">
            {summary.gpa?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div 
          onClick={() => navigate('/result')}
          className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-purple-500/10 dark:hover:bg-purple-500/20 transition-all cursor-pointer"
        >
          <div className="text-purple-500 mb-2">
            <div className="text-3xl">🎯</div>
          </div>
          <h3 className="text-sm text-slate-600 dark:text-slate-400 mb-1">CGPA</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">
            {summary.cgpa?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div 
          onClick={() => navigate('/subjects')}
          className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-green-500/10 dark:hover:bg-green-500/20 transition-all cursor-pointer"
        >
          <div className="text-green-500 mb-2">
            <div className="text-3xl">📚</div>
          </div>
          <h3 className="text-sm text-slate-600 dark:text-slate-400 mb-1">Subjects</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">
            {summary.total_subjects || 0}
          </p>
        </div>

        <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-orange-500/10 dark:hover:bg-orange-500/20 transition-all cursor-pointer">
          <div className="text-orange-500 mb-2">
            <div className="text-3xl">🏆</div>
          </div>
          <h3 className="text-sm text-slate-600 dark:text-slate-400 mb-1">Credits</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">
            {summary.total_credits || 0}
          </p>
        </div>
      </div>

      {/* Semester-wise GPA Trend */}
      <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Semester-wise GPA Trend</h2>
        {allSemestersData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <div className="text-6xl mb-4">📈</div>
              <p>No semester data available</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {allSemestersData.map((sem, index) => {
              const maxGPA = 4.0
              const percentage = (sem.gpa / maxGPA) * 100
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-800 dark:text-white">
                      Semester {sem.semester} ({sem.subjects} subjects)
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      GPA: {sem.gpa.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        sem.gpa >= 3.5 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                          : sem.gpa >= 3.0
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                          : sem.gpa >= 2.5
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                          : 'bg-gradient-to-r from-red-500 to-pink-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Subject Performance */}
      <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Current Semester Subject Performance</h2>
          <button
            onClick={async () => {
              try {
                await api.downloadPerformanceReport()
                alert('✅ Performance Report downloaded successfully!')
              } catch (error) {
                alert(`❌ Failed to download report: ${error.message}`)
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            📥 Download Report
          </button>
        </div>
        {subjectPerformance.length === 0 ? (
          <div className="text-center py-12 text-slate-600 dark:text-slate-400">
            No subject performance data available
          </div>
        ) : (
          <div className="space-y-4">
            {subjectPerformance.map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span className="font-semibold text-slate-800 dark:text-white">{subject.name}</span>
                    <span className="ml-2 text-slate-500 dark:text-slate-400 text-xs">({subject.code})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600 dark:text-slate-400">{subject.percentage}/100</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      subject.grade === 'A+' || subject.grade === 'A' 
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                        : subject.grade === 'A-' || subject.grade === 'B+'
                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        : subject.grade === 'B' || subject.grade === 'B-'
                        ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                        : 'bg-red-500/20 text-red-600 dark:text-red-400'
                    }`}>
                      {subject.grade}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      subject.percentage >= 90
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : subject.percentage >= 75
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                        : subject.percentage >= 60
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                        : 'bg-gradient-to-r from-red-500 to-pink-600'
                    }`}
                    style={{ width: `${subject.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </motion.div>
      <Navigation />
    </>
  )
}
