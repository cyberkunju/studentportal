import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import api from '../services/api'
import Icon from './Icon'

export default function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    api.logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center justify-center gap-2 bg-white/40 dark:bg-rich-black/40 backdrop-blur-2xl rounded-full shadow-lg p-2 border border-white/20 dark:border-baby-blue/20">
        <Link
          to="/dashboard"
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-colors ${
            isActive('/dashboard')
              ? 'text-white'
              : 'text-rich-black/60 dark:text-alice-blue/60 hover:bg-picton-blue/10'
          }`}
        >
          {isActive('/dashboard') && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-picton-blue rounded-full shadow-md"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <Icon name="home" size={20} className="relative z-10" ariaLabel="Dashboard" />
          <span className="text-sm relative z-10">Dashboard</span>
        </Link>

        <Link
          to="/subjects"
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-colors ${
            isActive('/subjects')
              ? 'text-white'
              : 'text-rich-black/60 dark:text-alice-blue/60 hover:bg-picton-blue/10'
          }`}
        >
          {isActive('/subjects') && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-picton-blue rounded-full shadow-md"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <Icon name="book" size={20} className="relative z-10" ariaLabel="Subjects" />
          <span className="text-sm relative z-10">Subjects</span>
        </Link>

        <Link
          to="/notice"
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-colors ${
            isActive('/notice')
              ? 'text-white'
              : 'text-rich-black/60 dark:text-alice-blue/60 hover:bg-picton-blue/10'
          }`}
        >
          {isActive('/notice') && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-picton-blue rounded-full shadow-md"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <Icon name="bell" size={20} className="relative z-10" ariaLabel="Notice" />
          <span className="text-sm relative z-10">Notice</span>
        </Link>

        <Link
          to="/result"
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-colors ${
            isActive('/result')
              ? 'text-white'
              : 'text-rich-black/60 dark:text-alice-blue/60 hover:bg-picton-blue/10'
          }`}
        >
          {isActive('/result') && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-picton-blue rounded-full shadow-md"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <Icon name="chart" size={20} className="relative z-10" ariaLabel="Results" />
          <span className="text-sm relative z-10">Results</span>
        </Link>

        <Link 
          to="/payments"
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-colors ${
            isActive('/payments')
              ? 'text-white'
              : 'text-rich-black/60 dark:text-alice-blue/60 hover:bg-picton-blue/10'
          }`}
        >
          {isActive('/payments') && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-picton-blue rounded-full shadow-md"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <Icon name="creditCard" size={20} className="relative z-10" ariaLabel="Payments" />
          <span className="text-sm relative z-10">Payments</span>
        </Link>

        <Link 
          to="/analysis"
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-colors ${
            isActive('/analysis')
              ? 'text-white'
              : 'text-rich-black/60 dark:text-alice-blue/60 hover:bg-picton-blue/10'
          }`}
        >
          {isActive('/analysis') && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-picton-blue rounded-full shadow-md"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <Icon name="trendingUp" size={20} className="relative z-10" ariaLabel="Analysis" />
          <span className="text-sm relative z-10">Analysis</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-rich-black/60 dark:text-alice-blue/60 hover:bg-baby-blue/10 hover:text-baby-blue transition-colors"
        >
          <Icon name="logout" size={20} ariaLabel="Logout" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </nav>
  )
}
