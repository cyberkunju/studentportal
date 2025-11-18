import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import ThemeToggle from '../components/ThemeToggle'
import Icon from '../components/Icon'
import api from '../services/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const highlightRef = useRef(null)
  const selectorRef = useRef(null)

  useEffect(() => {
    moveHighlight(role)
  }, [role])

  const moveHighlight = (selectedRole) => {
    const label = document.querySelector(`label[data-role="${selectedRole}"]`)
    if (label && highlightRef.current) {
      const labelWidth = label.offsetWidth
      const labelLeft = label.offsetLeft
      highlightRef.current.style.width = `${labelWidth}px`
      highlightRef.current.style.transform = `translateX(${labelLeft}px)`
    }
  }

  const handleLabelHover = (hoveredRole) => {
    moveHighlight(hoveredRole)
  }

  const handleMouseLeave = () => {
    moveHighlight(role)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await api.login(username, password, role)
      if (result.success) {
        // Redirect based on role
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard')
        } else if (result.user.role === 'teacher') {
          navigate('/teacher/dashboard')
        } else {
          navigate('/dashboard')
        }
      } else {
        setError(result.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center p-4 bg-alice-blue dark:bg-rich-black"
    >
      {/* Theme Toggle - Top Right Corner */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Minimalist Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-picton-blue/5 dark:bg-picton-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-baby-blue/5 dark:bg-baby-blue/10 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Glassmorphic Card */}
        <div className="bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl border border-rich-black/10 dark:border-alice-blue/10 rounded-3xl shadow-2xl p-10">
          
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-picton-blue rounded-2xl mb-4 shadow-lg"
            >
              <Icon name="user" size={32} color="white" ariaLabel="University Portal" />
            </motion.div>
            <h1 className="text-3xl font-bold text-rich-black dark:text-alice-blue mb-2">
              University Portal
            </h1>
            <p className="text-rich-black/60 dark:text-alice-blue/60 text-sm">
              Sign in to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selector - Moved to Top */}
            <div>
              <label className="block mb-3 text-rich-black/80 dark:text-alice-blue/80 font-semibold text-sm">
                Select Role
              </label>
              <div 
                ref={selectorRef}
                onMouseLeave={handleMouseLeave}
                className="relative flex bg-alice-blue/40 dark:bg-rich-black/40 rounded-xl border border-rich-black/10 dark:border-alice-blue/10 p-1"
              >
                <div
                  ref={highlightRef}
                  className="absolute top-1 left-0 h-[calc(100%-8px)] bg-picton-blue rounded-lg shadow-md transition-all duration-300 ease-out"
                />
                
                <input
                  type="radio"
                  id="role-student"
                  name="role"
                  value="student"
                  checked={role === 'student'}
                  onChange={(e) => setRole(e.target.value)}
                  className="hidden"
                />
                <label
                  htmlFor="role-student"
                  data-role="student"
                  onMouseEnter={() => handleLabelHover('student')}
                  className={`flex-1 py-2.5 text-center text-sm font-semibold cursor-pointer relative z-10 transition-colors duration-200 ${
                    role === 'student' ? 'text-white' : 'text-rich-black/70 dark:text-alice-blue/70'
                  }`}
                >
                  Student
                </label>

                <input
                  type="radio"
                  id="role-teacher"
                  name="role"
                  value="teacher"
                  checked={role === 'teacher'}
                  onChange={(e) => setRole(e.target.value)}
                  className="hidden"
                />
                <label
                  htmlFor="role-teacher"
                  data-role="teacher"
                  onMouseEnter={() => handleLabelHover('teacher')}
                  className={`flex-1 py-2.5 text-center text-sm font-semibold cursor-pointer relative z-10 transition-colors duration-200 ${
                    role === 'teacher' ? 'text-white' : 'text-rich-black/70 dark:text-alice-blue/70'
                  }`}
                >
                  Teacher
                </label>

                <input
                  type="radio"
                  id="role-admin"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={(e) => setRole(e.target.value)}
                  className="hidden"
                />
                <label
                  htmlFor="role-admin"
                  data-role="admin"
                  onMouseEnter={() => handleLabelHover('admin')}
                  className={`flex-1 py-2.5 text-center text-sm font-semibold cursor-pointer relative z-10 transition-colors duration-200 ${
                    role === 'admin' ? 'text-white' : 'text-rich-black/70 dark:text-alice-blue/70'
                  }`}
                >
                  Admin
                </label>
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label className="block mb-2 text-rich-black/80 dark:text-alice-blue/80 font-semibold text-sm">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rich-black/40 dark:text-alice-blue/40">
                  <Icon name="user" size={20} ariaLabel="Username" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-rich-black/30 dark:border-alice-blue/30 bg-white dark:bg-rich-black text-rich-black dark:text-alice-blue placeholder:text-rich-black/40 dark:placeholder:text-alice-blue/40 focus:outline-none focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/50 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block mb-2 text-rich-black/80 dark:text-alice-blue/80 font-semibold text-sm">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rich-black/40 dark:text-alice-blue/40">
                  <Icon name="lock" size={20} ariaLabel="Password" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-rich-black/30 dark:border-alice-blue/30 bg-white dark:bg-rich-black text-rich-black dark:text-alice-blue placeholder:text-rich-black/40 dark:placeholder:text-alice-blue/40 focus:outline-none focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/50 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-rich-black/40 dark:text-alice-blue/40 hover:text-picton-blue dark:hover:text-picton-blue transition-colors duration-200"
                >
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={20} ariaLabel={showPassword ? 'Hide password' : 'Show password'} />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 rounded-xl text-sm flex items-start gap-2"
              >
                <Icon name="alertCircle" size={18} className="flex-shrink-0 mt-0.5" ariaLabel="Error" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-picton-blue hover:bg-picton-blue-600 disabled:bg-rich-black/20 dark:disabled:bg-alice-blue/10 disabled:text-rich-black/40 dark:disabled:text-alice-blue/40 text-white font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:active:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Footer Links */}
            <div className="pt-4 text-center space-y-3">
              <a 
                href="#" 
                className="block text-picton-blue hover:text-picton-blue-600 font-medium text-sm transition-colors duration-200"
              >
                Forgot Password?
              </a>
              <div className="text-rich-black/60 dark:text-alice-blue/60 text-sm">
                Don't have an account?{' '}
                <a href="#" className="text-picton-blue hover:text-picton-blue-600 font-semibold transition-colors duration-200">
                  Contact Admin
                </a>
              </div>
            </div>
          </form>
        </div>

        {/* Bottom Info */}
        <p className="text-center mt-6 text-rich-black/50 dark:text-alice-blue/50 text-xs">
          © 2024 University Portal. All rights reserved.
        </p>
      </motion.div>
    </motion.div>
  )
}
