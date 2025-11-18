import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import Icon from '../components/Icon'
import api from '../services/api'

export default function TeacherMarks() {
  const navigate = useNavigate()
  const user = api.getCurrentUser()
  
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [error, setError] = useState(null)

  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [internalMarks, setInternalMarks] = useState('')
  const [externalMarks, setExternalMarks] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [calculatedGrade, setCalculatedGrade] = useState(null)

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/login')
      return
    }
    
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [subjectsResult, studentsResult] = await Promise.all([
        api.listSubjects({ department: user.department }).catch(err => ({ success: false })),
        api.getStudents({ department: user.department }).catch(err => ({ success: false }))
      ])

      if (subjectsResult.success && subjectsResult.data) {
        setSubjects(subjectsResult.data.subjects || [])
      }

      if (studentsResult.success && studentsResult.data) {
        setStudents(studentsResult.data.students || [])
      }

    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject)
    setSelectedStudent(null)
    setInternalMarks('')
    setExternalMarks('')
  }

  const handleStudentSelect = (student) => {
    setSelectedStudent(student)
    setInternalMarks('')
    setExternalMarks('')
  }

  const handleSubmit = async () => {
    const internal = parseFloat(internalMarks)
    const external = parseFloat(externalMarks)

    if (isNaN(internal) || internal < 0 || internal > 30) {
      alert('Internal marks must be between 0 and 30')
      return
    }

    if (isNaN(external) || external < 0 || external > 70) {
      alert('External marks must be between 0 and 70')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await api.enterMarks({
        student_id: selectedStudent.id,
        subject_id: selectedSubject.id,
        internal_marks: internal,
        external_marks: external
      })

      if (result.success && result.data) {
        setCalculatedGrade(result.data)
        setShowSuccessModal(true)
        
        setTimeout(() => {
          setShowSuccessModal(false)
          setSelectedSubject(null)
          setSelectedStudent(null)
          setInternalMarks('')
          setExternalMarks('')
          setCalculatedGrade(null)
        }, 4000)
      } else {
        alert('Failed to submit marks: ' + (result.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error submitting marks:', err)
      alert('Failed to submit marks: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTotalMarks = () => {
    const internal = parseFloat(internalMarks) || 0
    const external = parseFloat(externalMarks) || 0
    return internal + external
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-slate-800 dark:text-white">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={fetchData}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-24 px-4 py-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (selectedStudent) {
                setSelectedStudent(null)
              } else if (selectedSubject) {
                setSelectedSubject(null)
              } else {
                navigate('/teacher/dashboard')
              }
            }}
            className="w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-picton-blue/10 transition-all"
          >
            <Icon name="arrowLeft" size={20} className="text-slate-800 dark:text-white" />
          </button>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Marks Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-slate-700 dark:text-slate-300 font-medium">{user?.full_name}</span>
          <div className="w-10 h-10 rounded-full bg-picton-blue flex items-center justify-center text-white">
            <Icon name="edit" size={20} />
          </div>
        </div>
      </header>

      <p className="text-slate-600 dark:text-slate-400 mb-8">Enter marks for students (Internal: 30, External: 70)</p>

      {/* Progress Banner */}
      <div className="bg-gradient-to-br from-picton-blue to-baby-blue rounded-2xl p-6 mb-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Icon name="edit" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {!selectedSubject ? 'Select Subject' : !selectedStudent ? 'Select Student' : 'Enter Marks'}
              </h2>
              <p className="text-green-100">
                {selectedSubject && `${selectedSubject.subject_code} - ${selectedSubject.subject_name}`}
                {selectedStudent && ` → ${selectedStudent.first_name} ${selectedStudent.last_name}`}
              </p>
            </div>
          </div>
          {selectedSubject && selectedStudent && (
            <div className="text-right">
              <p className="text-sm text-green-100">Total Marks</p>
              <p className="text-4xl font-bold">{getTotalMarks()}/100</p>
            </div>
          )}
        </div>
      </div>

      {!selectedSubject ? (
        /* Step 1: Select Subject */
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Select Subject</h2>
          {subjects.length === 0 ? (
            <div className="text-center py-12 bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <Icon name="book" size={64} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 text-lg">No subjects assigned</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <motion.div
                  key={subject.id}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => handleSubjectSelect(subject)}
                  className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg cursor-pointer hover:bg-picton-blue/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-picton-blue/20 flex items-center justify-center">
                      <Icon name="book" size={24} className="text-picton-blue" />
                    </div>
                    <span className="px-3 py-1 bg-picton-blue/20 text-picton-blue rounded-full text-sm font-semibold">
                      Sem {subject.semester}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{subject.subject_name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{subject.subject_code}</p>
                  <button className="w-full px-4 py-2 bg-picton-blue hover:bg-picton-blue-600 text-white rounded-lg font-semibold transition-all">
                    Select
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : !selectedStudent ? (
        /* Step 2: Select Student */
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Select Student</h2>
          {students.length === 0 ? (
            <div className="text-center py-12 bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <Icon name="users" size={64} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 text-lg">No students found</p>
            </div>
          ) : (
            <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="space-y-3">
                {students.map((student) => (
                  <motion.div
                    key={student.id}
                    whileHover={{ x: 5 }}
                    onClick={() => handleStudentSelect(student)}
                    className="flex items-center gap-4 p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl hover:bg-picton-blue/10 cursor-pointer transition-all border border-slate-200 dark:border-slate-600"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {student.first_name[0]}{student.last_name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-white">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {student.student_id} • Semester {student.semester}
                      </p>
                    </div>
                    <Icon name="arrowRight" size={20} className="text-slate-400" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Step 3: Enter Marks */
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Enter Marks</h2>
          
          <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            {/* Student Info */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-picton-blue/10 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                {selectedStudent.first_name[0]}{selectedStudent.last_name[0]}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {selectedStudent.student_id} • Semester {selectedStudent.semester}
                </p>
              </div>
            </div>

            {/* Subject Info */}
            <div className="mb-6 p-4 bg-baby-blue/10 rounded-xl">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {selectedSubject.subject_name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {selectedSubject.subject_code} • {selectedSubject.credit_hours} Credits
              </p>
            </div>

            {/* Marks Entry Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                  Internal Marks (Max: 30)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.01"
                  value={internalMarks}
                  onChange={(e) => setInternalMarks(e.target.value)}
                  placeholder="Enter internal marks"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 text-slate-800 dark:text-white text-lg font-semibold focus:outline-none focus:border-picton-blue transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                  External Marks (Max: 70)
                </label>
                <input
                  type="number"
                  min="0"
                  max="70"
                  step="0.01"
                  value={externalMarks}
                  onChange={(e) => setExternalMarks(e.target.value)}
                  placeholder="Enter external marks"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-700/70 text-slate-800 dark:text-white text-lg font-semibold focus:outline-none focus:border-picton-blue transition-all"
                />
              </div>

              {/* Total Preview */}
              {(internalMarks || externalMarks) && (
                <div className="bg-gradient-to-r from-picton-blue to-baby-blue rounded-xl p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white/80 text-sm mb-1">Total Marks</p>
                      <p className="text-4xl font-bold">{getTotalMarks()}/100</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/80 text-sm mb-1">Breakdown</p>
                      <p className="text-lg font-semibold">
                        {internalMarks || 0} + {externalMarks || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !internalMarks || !externalMarks}
                className="w-full py-4 bg-gradient-to-r from-picton-blue to-baby-blue hover:from-picton-blue-600 hover:to-baby-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-lg rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="refresh" size={20} className="animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="check" size={20} />
                    Submit Marks
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && calculatedGrade && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Icon name="checkCircle" size={48} className="text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Marks Submitted!</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Marks have been recorded successfully
              </p>
            </div>

            {/* Grade Details */}
            <div className="bg-gradient-to-r from-picton-blue to-baby-blue rounded-xl p-6 text-white mb-4">
              <div className="text-center mb-4">
                <p className="text-white/80 text-sm mb-1">Grade Awarded</p>
                <p className="text-6xl font-bold mb-2">{calculatedGrade.letter_grade}</p>
                <p className="text-white/80">
                  Grade Point: {calculatedGrade.grade_point?.toFixed(2)}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-white/80 text-xs mb-1">Internal</p>
                  <p className="text-xl font-bold">{calculatedGrade.internal_marks}</p>
                </div>
                <div>
                  <p className="text-white/80 text-xs mb-1">External</p>
                  <p className="text-xl font-bold">{calculatedGrade.external_marks}</p>
                </div>
                <div>
                  <p className="text-white/80 text-xs mb-1">Total</p>
                  <p className="text-xl font-bold">{calculatedGrade.total_marks}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-gray-600 transition-all"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
