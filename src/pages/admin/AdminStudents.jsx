import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ThemeToggle from '../../components/ThemeToggle'
import ImageCropper from '../../components/ImageCropper'
import AnimatedDatePicker from '../../components/AnimatedDatePicker'
import CustomSelect from '../../components/CustomSelect'
import Icon from '../../components/Icon'
import api from '../../services/api'

export default function AdminStudents() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const user = api.getCurrentUser()
  
  // Get filter parameters from URL
  const urlYear = searchParams.get('year')
  const urlDepartment = searchParams.get('department')
  const [showAddForm, setShowAddForm] = useState(false)
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  
  // Form data
  const [formData, setFormData] = useState({
    student_id: '',
    full_name: '',
    username: '',
    email: '',
    password: '',
    department: 'BCA',
    semester: '1',
    year: new Date().getFullYear(),
    phone: '',
    date_of_birth: '',
    address: ''
  })

  const departments = ['BCA', 'BBA', 'B.Com']
  const semesters = ['1', '2', '3', '4', '5', '6']
  
  // Convert to options format for CustomSelect
  const departmentOptions = departments.map(dept => ({ value: dept, label: dept }))
  const semesterOptions = semesters.map(sem => ({ value: sem, label: `Semester ${sem}` }))

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
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    const response = await api.listStudents()
    if (response.success) {
      setStudents(response.data.students)
      filterStudents(response.data.students)
    }
    setLoading(false)
  }
  
  const filterStudents = (studentList) => {
    let filtered = studentList
    
    if (urlYear) {
      // Extract year number from "1st Year", "2nd Year", etc.
      const yearNum = parseInt(urlYear.match(/\d+/)[0])
      filtered = filtered.filter(s => s.year === yearNum)
    }
    
    if (urlDepartment) {
      filtered = filtered.filter(s => s.department === urlDepartment)
    }
    
    setFilteredStudents(filtered)
  }
  
  useEffect(() => {
    filterStudents(students)
  }, [urlYear, urlDepartment, students])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageCropped = (blob) => {
    setSelectedImage(blob)
    setImagePreview(URL.createObjectURL(blob))
    setShowCropper(false)
  }

  const handleEdit = (student) => {
    setIsEditMode(true)
    setEditingStudent(student) // Store original student data including original student_id
    setFormData({
      student_id: student.student_id,
      full_name: student.full_name,
      username: student.username || '',
      email: student.email || '',
      password: '',
      department: student.department,
      semester: student.semester,
      year: student.year || new Date().getFullYear(),
      phone: student.phone || '',
      date_of_birth: student.date_of_birth || '',
      address: student.address || ''
    })
    if (student.profile_image) {
      setImagePreview(student.profile_image)
    }
    setShowAddForm(true)
  }

  const handleDelete = (studentId) => {
    setStudentToDelete(studentId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    setLoading(true)
    setShowDeleteModal(false)
    
    const response = await api.deleteStudent(studentToDelete)
    
    if (response.success) {
      showToast('Student deleted successfully!', 'success')
      fetchStudents()
    } else {
      showToast(response.error || 'Failed to delete student', 'error')
    }
    setLoading(false)
    setStudentToDelete(null)
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setStudentToDelete(null)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditingStudent(null)
    setShowAddForm(false)
    setFormData({
      student_id: '',
      full_name: '',
      username: '',
      email: '',
      password: '',
      department: 'BCA',
      semester: '1',
      year: new Date().getFullYear(),
      phone: '',
      date_of_birth: '',
      address: ''
    })
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    let profileImageUrl = isEditMode ? (imagePreview || null) : null
    
    // Upload image if selected
    if (selectedImage) {
      console.log('Selected image:', selectedImage)
      console.log('Is Blob?', selectedImage instanceof Blob)
      console.log('Image type:', selectedImage.type)
      console.log('Image size:', selectedImage.size)
      
      {/* Validate that we have a valid blob */}
      if (!selectedImage || !(selectedImage instanceof Blob)) {
        showToast('Invalid image data. Please try uploading again.', 'error')
        setLoading(false)
        return
      }
      
      setUploading(true)
      const uploadResponse = await api.uploadImage(selectedImage)
      setUploading(false)
      
      console.log('Upload response:', uploadResponse)
      
      if (uploadResponse.success) {
        profileImageUrl = uploadResponse.image_url
      } else {
        showToast('Failed to upload image: ' + (uploadResponse.error || 'Unknown error'), 'error')
        setLoading(false)
        return
      }
    }
    
    // Add profile image URL to form data
    const submitData = { ...formData }
    if (profileImageUrl) {
      submitData.profile_image = profileImageUrl
    }
    
    console.log('Submitting student data:', submitData)
    const response = isEditMode 
      ? await api.updateStudent(editingStudent.student_id, submitData) // Use original student_id to find record
      : await api.addStudent(submitData)
    console.log(isEditMode ? 'Update student response:' : 'Add student response:', response)
    
    if (response.success) {
      showToast(isEditMode ? 'Student updated successfully!' : 'Student added successfully!', 'success')
      setShowAddForm(false)
      setIsEditMode(false)
      setEditingStudent(null)
      setFormData({
        student_id: '',
        full_name: '',
        username: '',
        email: '',
        password: '',
        department: 'BCA',
        semester: '1',
        year: new Date().getFullYear(),
        phone: '',
        date_of_birth: '',
        address: ''
      })
      setSelectedImage(null)
      setImagePreview(null)
      // Refresh the students list
      fetchStudents()
    } else {
      const errorMsg = response.error || response.message || (isEditMode ? 'Failed to update student' : 'Failed to add student')
      showToast(errorMsg, 'error')
      setLoading(false)
    }
  }

  const handleLogout = () => {
    api.logout()
    navigate('/login')
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
            className="w-10 h-10 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-picton-blue/10 transition-all duration-200"
          >
            <Icon name="arrowLeft" size={20} className="text-rich-black dark:text-alice-blue" />
          </button>
          <h1 className="text-3xl font-bold text-rich-black dark:text-alice-blue">Manage Students</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="text-rich-black/80 dark:text-alice-blue/80 font-medium">{user?.full_name}</span>
          <div className="w-10 h-10 rounded-full bg-picton-blue flex items-center justify-center text-white">
            <Icon name="user" size={20} />
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-baby-blue hover:bg-baby-blue-600 text-white rounded-lg font-semibold transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Add Student Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-picton-blue hover:bg-picton-blue-600 text-white rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all duration-200 active:scale-98"
        >
          <Icon name={showAddForm ? 'x' : 'plus'} size={20} />
          {showAddForm ? 'Cancel' : 'Add New Student'}
        </button>
      </div>

      {/* Add Student Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg mb-6"
        >
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
            {isEditMode ? 'Edit Student' : 'Add New Student'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Upload */}
            <div className="flex items-center gap-6 p-4 bg-picton-blue/10 dark:bg-picton-blue/20 rounded-lg">
              <div>
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-picton-blue"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <Icon name="user" size={32} className="text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-rich-black/80 dark:text-alice-blue/80 font-semibold mb-2">
                  Profile Photo (Optional)
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCropper(true)}
                    className="px-4 py-2 bg-picton-blue hover:bg-picton-blue-600 text-white rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2"
                  >
                    <Icon name="upload" size={16} />
                    {imagePreview ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setSelectedImage(null)
                      }}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-all duration-200"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-rich-black/60 dark:text-alice-blue/60 mt-2">
                  Image will be auto-cropped to circular format
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student ID */}
            <div>
              <label className="block text-rich-black/80 dark:text-alice-blue/80 font-semibold mb-2">
                Student ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                placeholder="e.g., S2025109"
                required
                className="w-full px-4 py-3 rounded-lg border border-baby-blue/30 dark:border-baby-blue/20 bg-white/50 dark:bg-rich-black/50 text-rich-black dark:text-alice-blue placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all duration-200"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-rich-black/80 dark:text-alice-blue/80 font-semibold mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
                className="w-full px-4 py-3 rounded-lg border border-baby-blue/30 dark:border-baby-blue/20 bg-white/50 dark:bg-rich-black/50 text-rich-black dark:text-alice-blue placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all duration-200"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-rich-black/80 dark:text-alice-blue/80 font-semibold mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="e.g., john.doe"
                required
                className="w-full px-4 py-3 rounded-lg border border-baby-blue/30 dark:border-baby-blue/20 bg-white/50 dark:bg-rich-black/50 text-rich-black dark:text-alice-blue placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all duration-200"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-rich-black/80 dark:text-alice-blue/80 font-semibold mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="student@university.edu"
                required
                className="w-full px-4 py-3 rounded-lg border border-baby-blue/30 dark:border-baby-blue/20 bg-white/50 dark:bg-rich-black/50 text-rich-black dark:text-alice-blue placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-rich-black/80 dark:text-alice-blue/80 font-semibold mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                required
                className="w-full px-4 py-3 rounded-lg border border-baby-blue/30 dark:border-baby-blue/20 bg-white/50 dark:bg-rich-black/50 text-rich-black dark:text-alice-blue placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all duration-200"
              />
            </div>

            {/* Department */}
            <CustomSelect
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              options={departmentOptions}
              label={<>Department <span className="text-red-500">*</span></>}
              placeholder="Select department"
              icon="fas fa-building"
            />

            {/* Semester */}
            <CustomSelect
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              options={semesterOptions}
              label={<>Semester <span className="text-red-500">*</span></>}
              placeholder="Select semester"
              icon="fas fa-calendar-alt"
            />

            {/* Year */}
            <div>
              <label className="block text-rich-black/80 dark:text-alice-blue/80 font-semibold mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min="2020"
                max="2030"
                required
                className="w-full px-4 py-3 rounded-lg border border-baby-blue/30 dark:border-baby-blue/20 bg-white/50 dark:bg-rich-black/50 text-rich-black dark:text-alice-blue placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all duration-200"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-rich-black/80 dark:text-alice-blue/80 font-semibold mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 234 567 8900"
                className="w-full px-4 py-3 rounded-lg border border-baby-blue/30 dark:border-baby-blue/20 bg-white/50 dark:bg-rich-black/50 text-rich-black dark:text-alice-blue placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all duration-200"
              />
            </div>

            {/* Date of Birth */}
            <AnimatedDatePicker
              label="Date of Birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
            />

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-rich-black/80 dark:text-alice-blue/80 font-semibold mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter full address"
                rows="3"
                className="w-full px-4 py-3 rounded-lg border border-baby-blue/30 dark:border-baby-blue/20 bg-white/50 dark:bg-rich-black/50 text-rich-black dark:text-alice-blue placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 transition-all duration-200"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                disabled={uploading || loading}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-lg transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Icon name="upload" size={20} className="animate-pulse" />
                    Uploading Image...
                  </>
                ) : loading ? (
                  <>
                    <Icon name="check" size={20} className="animate-pulse" />
                    {isEditMode ? 'Updating Student...' : 'Adding Student...'}
                  </>
                ) : (
                  <>
                    <Icon name="check" size={20} />
                    {isEditMode ? 'Update Student' : 'Add Student'}
                  </>
                )}
              </button>
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg shadow-lg transition-all duration-200 active:scale-98 flex items-center justify-center gap-2"
                >
                  <Icon name="x" size={20} />
                  Cancel
                </button>
              )}
            </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Students List */}
      <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-rich-black dark:text-alice-blue">
            {urlYear || urlDepartment ? 'Filtered Students' : 'All Students'}
          </h2>
          {(urlYear || urlDepartment) && (
            <div className="flex items-center gap-2">
              {urlYear && (
                <span className="px-3 py-1 bg-picton-blue/20 text-picton-blue dark:text-picton-blue-400 rounded-lg font-semibold text-sm">
                  {urlYear}
                </span>
              )}
              {urlDepartment && (
                <span className="px-3 py-1 bg-baby-blue/20 text-baby-blue-700 dark:text-baby-blue-400 rounded-lg font-semibold text-sm">
                  {urlDepartment}
                </span>
              )}
              <button
                onClick={() => navigate('/admin/students')}
                className="px-3 py-1 bg-gray-500/20 text-gray-600 dark:text-gray-400 rounded-lg font-semibold text-sm hover:bg-gray-500/30 transition-all duration-200"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="text-2xl text-rich-black dark:text-alice-blue">Loading...</div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="users" size={64} className="text-gray-400 mb-4 mx-auto" />
            <p className="text-rich-black/60 dark:text-alice-blue/60">
              {urlYear || urlDepartment ? 'No students found matching the filters.' : 'No students found. Add your first student!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-baby-blue/30 dark:border-baby-blue/20">
                  <th className="px-4 py-3 text-left text-rich-black/80 dark:text-alice-blue/80 font-semibold">Student ID</th>
                  <th className="px-4 py-3 text-left text-rich-black/80 dark:text-alice-blue/80 font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-rich-black/80 dark:text-alice-blue/80 font-semibold">Department</th>
                  <th className="px-4 py-3 text-left text-rich-black/80 dark:text-alice-blue/80 font-semibold">Year</th>
                  <th className="px-4 py-3 text-left text-rich-black/80 dark:text-alice-blue/80 font-semibold">Semester</th>
                  <th className="px-4 py-3 text-left text-rich-black/80 dark:text-alice-blue/80 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={index} className="border-b border-baby-blue/20 dark:border-baby-blue/10 hover:bg-picton-blue/10 transition-all duration-200">
                    <td className="px-4 py-3 text-rich-black dark:text-alice-blue">{student.student_id}</td>
                    <td className="px-4 py-3 text-rich-black dark:text-alice-blue">{student.full_name}</td>
                    <td className="px-4 py-3 text-rich-black dark:text-alice-blue">{student.department}</td>
                    <td className="px-4 py-3 text-rich-black dark:text-alice-blue">Year {student.year}</td>
                    <td className="px-4 py-3 text-rich-black dark:text-alice-blue">Sem {student.semester}</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleEdit(student)}
                        className="px-3 py-1.5 bg-baby-blue hover:bg-baby-blue-600 text-white rounded-lg font-semibold shadow-md transition-all duration-200 active:scale-98 mr-2 inline-flex items-center gap-1"
                      >
                        <Icon name="edit" size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.student_id)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-md transition-all duration-200 active:scale-98 inline-flex items-center gap-1"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Cropper Modal */}
      {showCropper && (
        <ImageCropper
          onImageCropped={handleImageCropped}
          onCancel={() => setShowCropper(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full shadow-2xl border border-red-200/50 dark:border-red-900/50"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <Icon name="exclamation" size={32} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-rich-black dark:text-alice-blue mb-3">
                Delete Student
              </h3>
              <p className="text-rich-black/70 dark:text-alice-blue/70 mb-6">
                Are you sure you want to delete this student? This action cannot be undone and will permanently remove all student data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-rich-black dark:text-alice-blue rounded-xl font-semibold shadow-md transition-all duration-200 active:scale-98"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-md transition-all duration-200 active:scale-98 flex items-center justify-center gap-2"
                >
                  <Icon name="trash" size={20} />
                  Delete
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
          transition={{ duration: 0.2 }}
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
            <Icon name={toast.type === 'success' ? 'check' : 'exclamation'} size={20} />
          </div>
          <p className="font-semibold flex-1">{toast.message}</p>
          <button
            onClick={() => setToast({ show: false, message: '', type: '' })}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors duration-200"
          >
            <Icon name="x" size={20} />
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
