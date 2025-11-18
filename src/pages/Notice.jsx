import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import ThemeToggle from '../components/ThemeToggle'
import Icon from '../components/Icon'
import api from '../services/api'

export default function Notice() {
  const navigate = useNavigate()
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const user = api.getCurrentUser()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const fetchNotices = async () => {
      try {
        const result = await api.getAllNotices()
        if (result.success && result.data) {
          setNotices(result.data.notices || [])
        }
      } catch (error) {
        console.error('Error fetching notices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotices()
  }, [])

  const categories = {
    general: { label: 'General', icon: 'info', color: 'picton-blue' },
    academic: { label: 'Academic', icon: 'book', color: 'picton-blue' },
    event: { label: 'Event', icon: 'calendar', color: 'baby-blue' },
    exam: { label: 'Exam', icon: 'document', color: 'baby-blue' },
    holiday: { label: 'Holiday', icon: 'calendar', color: 'non-photo-blue' },
    sports: { label: 'Sports', icon: 'star', color: 'baby-blue' }
  }

  const getCategoryIcon = (category) => {
    return categories[category]?.icon || 'info'
  }

  const getCategoryColor = (category) => {
    const color = categories[category]?.color || 'picton-blue'
    return `bg-${color}/20 text-${color}`
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-picton-blue/20 text-picton-blue dark:text-picton-blue-400 border-picton-blue/30',
      normal: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
      high: 'bg-baby-blue/20 text-baby-blue-700 dark:text-baby-blue-400 border-baby-blue/30',
      urgent: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
    }
    return colors[priority] || colors.normal
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-slate-800 dark:text-white">Loading...</div>
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
        className="min-h-screen pb-24 px-4 py-6 max-w-5xl mx-auto"
      >
      {/* Top Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-rich-black dark:text-alice-blue">Notice Board</h1>
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

      <p className="text-rich-black/60 dark:text-alice-blue/60 mb-8">Stay updated with announcements</p>

      {/* Notices */}
      <div className="space-y-6">
        {notices.length === 0 ? (
          <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-12 border border-white/20 dark:border-gray-700/20 shadow-lg text-center">
            <Icon name="bell" size={64} className="mx-auto mb-4 text-rich-black/20 dark:text-alice-blue/20" />
            <p className="text-rich-black/60 dark:text-alice-blue/60 text-lg">No notices available at the moment.</p>
          </div>
        ) : (
          notices.map((notice, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.2 }}
              className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg overflow-hidden hover:opacity-90 transition-opacity duration-200"
            >
              {/* Notice Content */}
              <div className="p-6 w-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(notice.category)}`}>
                        <Icon name={getCategoryIcon(notice.category)} size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-rich-black dark:text-alice-blue">{notice.title}</h3>
                        <p className="text-sm text-rich-black/60 dark:text-alice-blue/60">
                          {notice.created_by && `Posted by ${notice.created_by} • `}
                          {new Date(notice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-4">
                  {notice.priority && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(notice.priority)}`}>
                      {notice.priority.toUpperCase()}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(notice.category)}`}>
                    {categories[notice.category]?.label || notice.category}
                  </span>
                </div>

                {/* Content */}
                <p className="text-rich-black/80 dark:text-alice-blue/80 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                
                {/* Pay Now Button for Fee Notices */}
                {notice.feeDetails && (
                  <div className="mt-6 pt-6 border-t border-rich-black/10 dark:border-alice-blue/10">
                    <button
                      onClick={() => navigate('/payments')}
                      className="w-full py-4 bg-gradient-to-r from-picton-blue to-baby-blue hover:from-picton-blue-600 hover:to-baby-blue-600 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-3"
                    >
                      <Icon name="creditCard" size={20} className="text-white" />
                      Pay Now - ₹{notice.feeDetails.amount}
                    </button>
                    <p className="text-center text-sm text-rich-black/60 dark:text-alice-blue/60 mt-3">
                      <Icon name="info" size={16} className="inline mr-1" />
                      Click to proceed to payment page
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
      </motion.div>
      <Navigation />
    </>
  )
}
