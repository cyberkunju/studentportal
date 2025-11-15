import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import ThemeToggle from '../components/ThemeToggle'
import api from '../services/api'

export default function Payments() {
  const navigate = useNavigate()
  const [fees, setFees] = useState([])
  const [paymentHistory, setPaymentHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const user = api.getCurrentUser()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    fetchPaymentData()
  }, [])

  const fetchPaymentData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [feesResult, paymentsResult] = await Promise.all([
        api.getFees().catch(err => ({ success: false, error: err.message })),
        api.getPayments().catch(err => ({ success: false, error: err.message }))
      ])

      if (feesResult.success && feesResult.data) {
        setFees(feesResult.data.fees || [])
      }

      if (paymentsResult.success && paymentsResult.data) {
        setPaymentHistory(paymentsResult.data.payments || [])
      }

    } catch (err) {
      console.error('Error fetching payment data:', err)
      setError(err.message || 'Failed to fetch payment data')
    } finally {
      setLoading(false)
    }
  }

  const handlePayNow = (fee) => {
    const totalAmount = parseFloat(fee.amount) + parseFloat(fee.current_late_fine || 0)
    
    const confirmed = window.confirm(
      `💳 Proceed to Payment?\n\n` +
      `Fee: ${fee.fee_name}\n` +
      `Amount: ₹${parseFloat(fee.amount).toLocaleString()}\n` +
      (fee.current_late_fine > 0 ? `Late Fine: ₹${parseFloat(fee.current_late_fine).toLocaleString()}\n` : '') +
      `Total: ₹${totalAmount.toLocaleString()}\n\n` +
      `You will be redirected to the payment gateway.\n` +
      `(Mock payment - feature in development)`
    )
    
    if (!confirmed) return
    
    alert('🚧 Payment Gateway Integration\n\nThis feature will be available soon.\nYou can pay fees at the admin office.')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-slate-800 dark:text-white">Loading payments...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={fetchPaymentData}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const today = new Date()
  const overdueFees = fees.filter(f => {
    if (f.payment_status === 'completed') return false
    const dueDate = new Date(f.due_date)
    return today > dueDate
  })
  const pendingFees = fees.filter(f => {
    if (f.payment_status === 'completed') return false
    const dueDate = new Date(f.due_date)
    return today <= dueDate
  })

  const renderFee = (fee, index, isOverdue = false) => {
    const dueDate = new Date(fee.due_date)
    const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
    const totalAmount = parseFloat(fee.amount) + parseFloat(fee.current_late_fine || 0)
    
    return (
      <div
        key={index}
        className={`p-5 rounded-xl transition-all border-2 ${
          isOverdue
            ? 'bg-red-500/10 dark:bg-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/30 border-red-500/50'
            : 'bg-orange-500/10 dark:bg-orange-500/20 hover:bg-orange-500/20 dark:hover:bg-orange-500/30 border-orange-500/30'
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-4 flex-1">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              isOverdue ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'
            }`}>
              <div className="text-2xl">{isOverdue ? '⚠️' : '🕐'}</div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">
                {fee.fee_name}
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-slate-600 dark:text-slate-400">
                  📅 Due: {new Date(fee.due_date).toLocaleDateString('en-IN', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  {!isOverdue && daysRemaining > 0 && (
                    <span className="ml-2 text-orange-600 dark:text-orange-400 font-semibold">
                      ({daysRemaining} days left)
                    </span>
                  )}
                  {isOverdue && (
                    <span className="ml-2 text-red-600 dark:text-red-400 font-bold">
                      ⚠️ OVERDUE
                    </span>
                  )}
                </p>
                {fee.description && (
                  <p className="text-slate-600 dark:text-slate-400">
                    📝 {fee.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              ₹{parseFloat(fee.amount).toLocaleString()}
            </p>
            {fee.current_late_fine > 0 && (
              <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
                + ₹{parseFloat(fee.current_late_fine).toLocaleString()} (Fine)
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-600">
          <button
            onClick={() => handlePayNow(fee)}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            💳 Pay Now - ₹{totalAmount.toLocaleString()}
          </button>
        </div>
      </div>
    )
  }

  const renderPayment = (payment, index) => {
    return (
      <div
        key={index}
        className="p-5 rounded-xl transition-all border-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/70 border-green-500/40"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500/20 text-green-500">
              <div className="text-2xl">✅</div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">
                {payment.fee_name}
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-slate-600 dark:text-slate-400">
                  📅 Paid on: {new Date(payment.payment_date).toLocaleDateString('en-IN', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  🧾 Receipt: {payment.receipt_number}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  💳 Method: {payment.payment_method}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              ₹{parseFloat(payment.amount_paid).toLocaleString()}
            </p>
            {payment.late_fine > 0 && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                (includes ₹{parseFloat(payment.late_fine).toLocaleString()} fine)
              </p>
            )}
            <span className="inline-block mt-2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              PAID
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-600">
          <button
            onClick={async () => {
              try {
                await api.downloadReceipt(payment.id)
                alert('✅ Receipt downloaded successfully!')
              } catch (error) {
                alert(`❌ Failed to download receipt: ${error.message}`)
              }
            }}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            📥 Download Receipt
          </button>
        </div>
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
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Fee Payments</h1>
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

        <p className="text-slate-600 dark:text-slate-400 mb-8">Manage your payments and dues</p>

        <div className="space-y-8">
          {/* Overdue Fees Section */}
          {overdueFees.length > 0 && (
            <div className="bg-red-500/10 dark:bg-red-500/20 backdrop-blur-xl rounded-2xl p-6 border-2 border-red-500/50 shadow-lg">
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-3">
                  ⚠️ Overdue Fees ({overdueFees.length})
                </h2>
              </div>
              <p className="text-red-700 dark:text-red-300 mb-4">
                ℹ️ These payments are past their due date. Additional fines may apply.
              </p>
              <div className="space-y-4">
                {overdueFees.map((fee, index) => renderFee(fee, `overdue_${index}`, true))}
              </div>
            </div>
          )}

          {/* Pending Fees Section */}
          {pendingFees.length > 0 && (
            <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                  🕐 Pending Fees ({pendingFees.length})
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                ℹ️ Pay before the due date to avoid fines.
              </p>
              <div className="space-y-4">
                {pendingFees.map((fee, index) => renderFee(fee, `pending_${index}`, false))}
              </div>
            </div>
          )}

          {/* Paid Fees Section */}
          {paymentHistory.length > 0 && (
            <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                  ✅ Payment History ({paymentHistory.length})
                </h2>
              </div>
              <div className="space-y-4">
                {paymentHistory.map((payment, index) => renderPayment(payment, `paid_${index}`))}
              </div>
            </div>
          )}

          {/* No Payments */}
          {fees.length === 0 && paymentHistory.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl text-green-500 mb-4">✅</div>
              <p className="text-slate-600 dark:text-slate-400 text-lg">No fee payments found!</p>
            </div>
          )}
        </div>
      </motion.div>
      <Navigation />
    </>
  )
}
