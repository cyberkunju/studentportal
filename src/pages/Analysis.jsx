import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import ThemeToggle from '../components/ThemeToggle'
import Icon from '../components/Icon'
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
        <h1 className="text-3xl font-bold text-rich-black dark:text-alice-blue">Performance Analysis</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
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
      </header>

      <p className="text-rich-black/60 dark:text-alice-blue/60 mb-8">Track your academic progress</p>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => navigate('/result')}
          className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:opacity-90 transition-opacity duration-200 cursor-pointer"
        >
          <div className="mb-2">
            <Icon name="chart" size={32} className="text-picton-blue" />
          </div>
          <h3 className="text-sm text-rich-black/60 dark:text-alice-blue/60 mb-1">Current GPA</h3>
          <p className="text-3xl font-bold text-rich-black dark:text-alice-blue">
            {summary.gpa?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div 
          onClick={() => navigate('/result')}
          className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:opacity-90 transition-opacity duration-200 cursor-pointer"
        >
          <div className="mb-2">
            <Icon name="trendingUp" size={32} className="text-baby-blue-700" />
          </div>
          <h3 className="text-sm text-rich-black/60 dark:text-alice-blue/60 mb-1">CGPA</h3>
          <p className="text-3xl font-bold text-rich-black dark:text-alice-blue">
            {summary.cgpa?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div 
          onClick={() => navigate('/subjects')}
          className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:opacity-90 transition-opacity duration-200 cursor-pointer"
        >
          <div className="mb-2">
            <Icon name="book" size={32} className="text-picton-blue" />
          </div>
          <h3 className="text-sm text-rich-black/60 dark:text-alice-blue/60 mb-1">Subjects</h3>
          <p className="text-3xl font-bold text-rich-black dark:text-alice-blue">
            {summary.total_subjects || 0}
          </p>
        </div>

        <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:opacity-90 transition-opacity duration-200 cursor-pointer">
          <div className="mb-2">
            <Icon name="star" size={32} className="text-baby-blue-700" />
          </div>
          <h3 className="text-sm text-rich-black/60 dark:text-alice-blue/60 mb-1">Credits</h3>
          <p className="text-3xl font-bold text-rich-black dark:text-alice-blue">
            {summary.total_credits || 0}
          </p>
        </div>
      </div>

      {/* Semester-wise GPA Trend */}
      <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-rich-black dark:text-alice-blue mb-6">Semester-wise GPA Trend</h2>
        {allSemestersData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-rich-black/40 dark:text-alice-blue/40">
            <div className="text-center">
              <Icon name="trendingUp" size={64} className="mx-auto mb-4 text-rich-black/20 dark:text-alice-blue/20" />
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
                    <span className="font-semibold text-rich-black dark:text-alice-blue">
                      Semester {sem.semester} ({sem.subjects} subjects)
                    </span>
                    <span className="text-rich-black/60 dark:text-alice-blue/60">
                      GPA: {sem.gpa.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-rich-black/10 dark:bg-alice-blue/10 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-300 ${
                        sem.gpa >= 3.5 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                          : sem.gpa >= 3.0
                          ? 'bg-gradient-to-r from-picton-blue to-baby-blue'
                          : sem.gpa >= 2.5
                          ? 'bg-gradient-to-r from-baby-blue to-non-photo-blue'
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
      <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-rich-black dark:text-alice-blue">Current Semester Subject Performance</h2>
          <button
            onClick={async () => {
              try {
                await api.downloadPerformanceReport()
                alert('✅ Performance Report downloaded successfully!')
              } catch (error) {
                alert(`❌ Failed to download report: ${error.message}`)
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-picton-blue to-baby-blue hover:from-picton-blue-600 hover:to-baby-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Icon name="download" size={20} className="text-white" />
            Download Report
          </button>
        </div>
        {subjectPerformance.length === 0 ? (
          <div className="text-center py-12 text-rich-black/60 dark:text-alice-blue/60">
            No subject performance data available
          </div>
        ) : (
          <div className="space-y-4">
            {subjectPerformance.map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span className="font-semibold text-rich-black dark:text-alice-blue">{subject.name}</span>
                    <span className="ml-2 text-rich-black/60 dark:text-alice-blue/60 text-xs">({subject.code})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-rich-black/60 dark:text-alice-blue/60">{subject.percentage}/100</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      subject.grade === 'A+' || subject.grade === 'A' 
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                        : subject.grade === 'A-' || subject.grade === 'B+'
                        ? 'bg-picton-blue/20 text-picton-blue dark:text-picton-blue-400'
                        : subject.grade === 'B' || subject.grade === 'B-'
                        ? 'bg-baby-blue/20 text-baby-blue-700 dark:text-baby-blue-400'
                        : 'bg-red-500/20 text-red-600 dark:text-red-400'
                    }`}>
                      {subject.grade}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-rich-black/10 dark:bg-alice-blue/10 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      subject.percentage >= 90
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : subject.percentage >= 75
                        ? 'bg-gradient-to-r from-picton-blue to-baby-blue'
                        : subject.percentage >= 60
                        ? 'bg-gradient-to-r from-baby-blue to-non-photo-blue'
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
