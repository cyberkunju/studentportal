import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import Icon from '../components/Icon'
import api from '../services/api'

export default function TeacherAttendance() {
  const navigate = useNavigate()
  const user = api.getCurrentUser()
  
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState({})
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

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
        const subjects = subjectsResult.data.subjects || []
        setCourses(subjects.map(s => ({
          id: s.id,
          code: s.subject_code,
          name: s.subject_name,
          semester: s.semester
        })))
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

  const handleCourseSelect = (course) => {
    setSelectedCourse(course)
    const initialAttendance = {}
    students.forEach(student => {
      initialAttendance[student.id] = 'present'
    })
    setAttendance(initialAttendance)
  }

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleSubmit = () => {
    setShowConfirmModal(true)
  }

  const confirmSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const attendanceArray = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: parseInt(studentId),
        status
      }))

      const result = await api.markAttendance({
        subject_id: selectedCourse.id,
        attendance_date: attendanceDate,
        attendance: attendanceArray
      })

      if (result.success) {
        setShowConfirmModal(false)
        setShowSuccessMessage(true)
        
        setTimeout(() => {
          setShowSuccessMessage(false)
          setSelectedCourse(null)
          setAttendance({})
        }, 3000)
      } else {
        alert('Failed to submit attendance: ' + (result.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error submitting attendance:', err)
      alert('Failed to submit attendance: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPresentCount = () => {
    return Object.values(attendance).filter(status => status === 'present').length
  }

  const getAbsentCount = () => {
    return Object.values(attendance).filter(status => status === 'absent').length
  }

  const getTodayDate = () => {
    const date = new Date(attendanceDate)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
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
            onClick={() => selectedCourse ? setSelectedCourse(null) : navigate('/teacher/dashboard')}
            className="w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-picton-blue/10 transition-all"
          >
            <Icon name="arrowLeft" size={20} className="text-slate-800 dark:text-white" />
          </button>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Attendance Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-slate-700 dark:text-slate-300 font-medium">{user?.full_name}</span>
          <div className="w-10 h-10 rounded-full bg-picton-blue flex items-center justify-center text-white">
            <Icon name="calendar" size={20} />
          </div>
        </div>
      </header>

      {/* Date Banner */}
      <div className="bg-gradient-to-r from-picton-blue to-baby-blue rounded-2xl p-6 mb-8 text-white shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Icon name="calendar" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{getTodayDate()}</h2>
              <p className="text-white/80">Mark attendance for your class</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-white font-semibold">Date:</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-picton-blue"
            />
          </div>
          {selectedCourse && (
            <div className="text-right">
              <p className="text-sm text-white/80">Selected Course</p>
              <p className="text-xl font-bold">{selectedCourse.name}</p>
              <p className="text-white/80 text-sm">{selectedCourse.code}</p>
            </div>
          )}
        </div>
      </div>

      {!selectedCourse ? (
        /* Course Selection Grid */
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Select Your Course</h2>
          {courses.length === 0 ? (
            <div className="text-center py-12 bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <Icon name="book" size={64} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-2">No courses available</p>
              <p className="text-slate-500 dark:text-slate-500 text-sm">No subjects assigned to you</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => handleCourseSelect(course)}
                className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg cursor-pointer hover:bg-picton-blue/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-picton-blue/20 flex items-center justify-center">
                    <Icon name="book" size={24} className="text-picton-blue" />
                  </div>
                  <span className="px-3 py-1 bg-picton-blue/20 text-picton-blue rounded-full text-sm font-semibold">
                    Sem {course.semester}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{course.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{course.code}</p>
                <button className="w-full px-4 py-2 bg-picton-blue hover:bg-picton-blue-600 text-white rounded-lg font-semibold transition-all">
                  Select Course
                </button>
              </motion.div>
            ))}
            </div>
          )}
        </div>
      ) : (
        /* Attendance Marking Interface */
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-picton-blue to-baby-blue rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/90 font-medium">Total Students</p>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon name="users" size={20} />
                </div>
              </div>
              <p className="text-4xl font-bold">{students.length}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/90 font-medium">Present</p>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon name="checkCircle" size={20} />
                </div>
              </div>
              <p className="text-4xl font-bold">{getPresentCount()}</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/90 font-medium">Absent</p>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon name="xCircle" size={20} />
                </div>
              </div>
              <p className="text-4xl font-bold">{getAbsentCount()}</p>
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Student Attendance</h3>
            
            {students.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="users" size={64} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-lg">No students found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => {
                  const studentId = student.id
                  const studentName = `${student.first_name} ${student.last_name}`
                  
                  return (
                  <motion.div
                    key={studentId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      backgroundColor: attendance[studentId] === 'present' 
                        ? 'rgba(34, 197, 94, 0.1)' 
                        : attendance[studentId] === 'absent'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : undefined
                    }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      attendance[studentId] === 'present'
                        ? 'border-green-400 dark:border-green-500 bg-green-50/50 dark:bg-green-900/20'
                        : attendance[studentId] === 'absent'
                        ? 'border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-900/20'
                        : 'border-white/20 bg-white/50 dark:bg-gray-700/30 hover:bg-white/70 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative">
                        {student.profile_image ? (
                          <img 
                            src={student.profile_image} 
                            alt={studentName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {student.first_name[0]}{student.last_name[0]}
                          </div>
                        )}
                        {attendance[studentId] === 'present' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center border-2 border-white dark:border-gray-800"
                          >
                            <Icon name="check" size={12} className="text-white" />
                          </motion.div>
                        )}
                        {attendance[studentId] === 'absent' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center border-2 border-white dark:border-gray-800"
                          >
                            <Icon name="x" size={12} className="text-white" />
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{studentName}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{student.student_id}</p>
                      </div>
                    </div>

                    {/* Attendance Toggle Buttons */}
                    <div className="flex items-center gap-3">
                      <motion.button
                        onClick={() => handleAttendanceChange(studentId, 'present')}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                          attendance[studentId] === 'present'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl shadow-green-500/50 ring-2 ring-green-400'
                            : 'bg-white/50 dark:bg-gray-600/50 text-slate-600 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-green-900/20 border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        <Icon name="check" size={20} />
                        Present
                      </motion.button>
                      <motion.button
                        onClick={() => handleAttendanceChange(studentId, 'absent')}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                          attendance[studentId] === 'absent'
                            ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-xl shadow-red-500/50 ring-2 ring-red-400'
                            : 'bg-white/50 dark:bg-gray-600/50 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        <Icon name="x" size={20} />
                        Absent
                      </motion.button>
                    </div>
                  </motion.div>
                )})}
              </div>
            )}
          </div>

          {/* Submit Button */}
          {students.length > 0 && (
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                className="px-12 py-4 bg-gradient-to-r from-picton-blue to-baby-blue hover:from-picton-blue-600 hover:to-baby-blue-600 text-white rounded-xl font-bold text-lg shadow-2xl transition-all transform hover:scale-105"
              >
                <Icon name="check" size={20} className="inline mr-2" />
                Confirm Attendance
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-baby-blue/20 flex items-center justify-center mx-auto mb-4">
                <Icon name="exclamationCircle" size={32} className="text-baby-blue" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Confirm Attendance</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Are you sure you want to submit attendance for {selectedCourse?.code}?
              </p>
            </div>

            <div className="bg-slate-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-slate-600 dark:text-slate-400">Date:</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {new Date(attendanceDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-600 dark:text-slate-400">Total Students:</span>
                <span className="font-bold text-slate-800 dark:text-white">{students.length}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-green-600 dark:text-green-400">Present:</span>
                <span className="font-bold text-green-600 dark:text-green-400">{getPresentCount()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600 dark:text-red-400">Absent:</span>
                <span className="font-bold text-red-600 dark:text-red-400">{getAbsentCount()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-picton-blue to-baby-blue text-white rounded-lg font-semibold hover:from-picton-blue-600 hover:to-baby-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Icon name="refresh" size={20} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Icon name="check" size={20} />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="checkCircle" size={48} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Attendance Submitted!</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Attendance has been successfully recorded for {selectedCourse?.code}
            </p>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
