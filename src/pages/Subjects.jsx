import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import ThemeToggle from '../components/ThemeToggle'
import Icon from '../components/Icon'
import api from '../services/api'

export default function Subjects() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSemester, setSelectedSemester] = useState(null)
  const user = api.getCurrentUser()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    fetchSubjects(user.semester || null)
  }, [])

  const fetchSubjects = async (semester) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await api.getMarks(semester)
      
      if (result.success && result.data) {
        setSubjects(result.data.marks || [])
      } else {
        setError(result.message || 'Failed to fetch subjects')
      }
    } catch (err) {
      console.error('Error fetching subjects:', err)
      setError(err.message || 'Failed to fetch subjects')
    } finally {
      setLoading(false)
    }
  }

  const handleSemesterChange = (semester) => {
    setSelectedSemester(semester)
    fetchSubjects(semester)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-slate-800 dark:text-white">Loading subjects...</div>
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
        className="min-h-screen pb-24 px-4 py-6 max-w-6xl mx-auto"
      >
      {/* Top Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-rich-black dark:text-alice-blue">My Subjects</h1>
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

      {/* Semester Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => handleSemesterChange(null)}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
            selectedSemester === null
              ? 'bg-picton-blue text-white'
              : 'bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl text-rich-black/80 dark:text-alice-blue/80 hover:bg-picton-blue/10'
          }`}
        >
          Current
        </button>
        {[1, 2, 3, 4, 5, 6].map((sem) => (
          <button
            key={sem}
            onClick={() => handleSemesterChange(sem)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              selectedSemester === sem
                ? 'bg-picton-blue text-white'
                : 'bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl text-rich-black/80 dark:text-alice-blue/80 hover:bg-picton-blue/10'
            }`}
          >
            Sem {sem}
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-r from-picton-blue to-baby-blue rounded-2xl p-6 mb-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Semester {selectedSemester || user?.semester || '1'} - {user?.department || 'Department'}
            </h2>
            <p className="text-alice-blue/90">Current semester courses</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{subjects.length}</p>
            <p className="text-alice-blue/90 text-sm">Subjects</p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-xl text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={() => fetchSubjects(selectedSemester)}
            className="px-6 py-2 bg-picton-blue text-white rounded-lg hover:bg-picton-blue-600 transition-all duration-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Subjects Grid */}
      {!error && subjects.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="book" size={64} className="mx-auto mb-4 text-rich-black/20 dark:text-alice-blue/20" />
          <p className="text-rich-black/60 dark:text-alice-blue/60 text-lg">No subjects found for this semester</p>
        </div>
      ) : !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((subject, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.2 }}
              className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg hover:opacity-90 transition-opacity duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-picton-blue/20 flex items-center justify-center">
                  <Icon name="book" size={24} className="text-picton-blue" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 bg-picton-blue/20 text-picton-blue dark:text-picton-blue-400 rounded-full text-sm font-semibold">
                    {subject.credit_hours} Credits
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    subject.letter_grade === 'A+' || subject.letter_grade === 'A' || subject.letter_grade === 'A-'
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                      : subject.letter_grade === 'B+' || subject.letter_grade === 'B' || subject.letter_grade === 'B-'
                      ? 'bg-picton-blue/20 text-picton-blue dark:text-picton-blue-400'
                      : subject.letter_grade === 'C+' || subject.letter_grade === 'C' || subject.letter_grade === 'C-'
                      ? 'bg-baby-blue/20 text-baby-blue-700 dark:text-baby-blue-400'
                      : 'bg-red-500/20 text-red-600 dark:text-red-400'
                  }`}>
                    Grade: {subject.letter_grade}
                  </span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue mb-2">
                {subject.subject_name}
              </h3>
              <p className="text-rich-black/60 dark:text-alice-blue/60 text-sm mb-4">
                {subject.subject_code}
              </p>

              {/* Marks Breakdown */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-picton-blue/10 dark:bg-picton-blue/20 rounded-lg">
                  <p className="text-xs text-rich-black/60 dark:text-alice-blue/60 mb-1">Internal</p>
                  <p className="text-lg font-bold text-rich-black dark:text-alice-blue">{subject.internal_marks}</p>
                </div>
                <div className="text-center p-2 bg-baby-blue/10 dark:bg-baby-blue/20 rounded-lg">
                  <p className="text-xs text-rich-black/60 dark:text-alice-blue/60 mb-1">External</p>
                  <p className="text-lg font-bold text-rich-black dark:text-alice-blue">{subject.external_marks}</p>
                </div>
                <div className="text-center p-2 bg-picton-blue/10 dark:bg-picton-blue/20 rounded-lg">
                  <p className="text-xs text-rich-black/60 dark:text-alice-blue/60 mb-1">Total</p>
                  <p className="text-lg font-bold text-rich-black dark:text-alice-blue">{subject.total_marks}</p>
                </div>
              </div>

              {/* Grade Details */}
              <div className="flex justify-between items-center pt-3 border-t border-rich-black/10 dark:border-alice-blue/10">
                <div className="text-sm text-rich-black/60 dark:text-alice-blue/60">
                  <span className="font-semibold">GP:</span> {subject.grade_point?.toFixed(2)}
                </div>
                <div className="text-sm text-rich-black/60 dark:text-alice-blue/60">
                  <span className="font-semibold">CP:</span> {subject.credit_points?.toFixed(2)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      </motion.div>
      <Navigation />
    </>
  )
}
