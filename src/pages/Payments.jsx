import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import ThemeToggle from '../components/ThemeToggle'
import Icon from '../components/Icon'
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
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-picton-blue rounded-2xl mb-4 animate-pulse">
            <Icon name="creditCard" size={32} color="white" ariaLabel="Loading" />
          </div>
          <div className="text-xl text-rich-black dark:text-alice-blue font-medium">Loading payments...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl mb-4">
            <Icon name="exclamationCircle" size={32} className="text-red-600 dark:text-red-400" ariaLabel="Error" />
          </div>
          <div className="text-xl text-rich-black dark:text-alice-blue font-semibold mb-2">Failed to Load</div>
          <div className="text-rich-black/60 dark:text-alice-blue/60 mb-6">{error}</div>
          <button
            onClick={fetchPaymentData}
            className="px-6 py-3 bg-picton-blue text-white rounded-xl hover:bg-picton-blue-600 font-semibold transition-all duration-200 active:scale-95"
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
        className={`p-5 rounded-xl transition-all duration-200 border ${
          isOverdue
            ? 'bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl border-[#E74C3C]/30 hover:shadow-xl'
            : 'bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl border-[#F2C94C]/30 hover:shadow-xl'
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-4 flex-1">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isOverdue ? 'bg-[#E74C3C]/10' : 'bg-[#F2C94C]/10'
            }`}>
              <Icon name={isOverdue ? "exclamationCircle" : "clock"} size={24} className={isOverdue ? "text-[#E74C3C]" : "text-[#F2C94C]"} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-rich-black dark:text-alice-blue mb-1">
                {fee.fee_name}
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-rich-black/60 dark:text-alice-blue/60">
                  <Icon name="calendar" size={16} className="inline mr-1" />
                  Due: {new Date(fee.due_date).toLocaleDateString('en-IN', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  {!isOverdue && daysRemaining > 0 && (
                    <span className="ml-2 text-[#F2C94C] font-semibold">
                      ({daysRemaining} days left)
                    </span>
                  )}
                  {isOverdue && (
                    <span className="ml-2 px-2 py-0.5 bg-[#E74C3C]/20 text-[#E74C3C] rounded font-bold text-xs">
                      OVERDUE
                    </span>
                  )}
                </p>
                {fee.description && (
                  <p className="text-rich-black/60 dark:text-alice-blue/60">
                    <Icon name="document" size={16} className="inline mr-1" />
                    {fee.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-rich-black dark:text-alice-blue">
              ₹{parseFloat(fee.amount).toLocaleString()}
            </p>
            {fee.current_late_fine > 0 && (
              <p className="text-lg font-bold text-[#E74C3C] mt-1">
                + ₹{parseFloat(fee.current_late_fine).toLocaleString()} (Fine)
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-rich-black/10 dark:border-alice-blue/10">
          <button
            onClick={() => handlePayNow(fee)}
            className="w-full py-3 bg-picton-blue hover:bg-picton-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
          >
            <Icon name="creditCard" size={20} className="text-white" />
            Pay Now - ₹{totalAmount.toLocaleString()}
          </button>
        </div>
      </div>
    )
  }

  const renderPayment = (payment, index) => {
    return (
      <div
        key={index}
        className="p-5 rounded-xl transition-all duration-200 bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl border border-[#00B894]/30 hover:shadow-xl"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#00B894]/10">
              <Icon name="checkCircle" size={24} className="text-[#00B894]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-rich-black dark:text-alice-blue mb-1">
                {payment.fee_name}
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-rich-black/60 dark:text-alice-blue/60">
                  <Icon name="calendar" size={16} className="inline mr-1" />
                  Paid on: {new Date(payment.payment_date).toLocaleDateString('en-IN', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-rich-black/60 dark:text-alice-blue/60">
                  <Icon name="document" size={16} className="inline mr-1" />
                  Receipt: {payment.receipt_number}
                </p>
                <p className="text-rich-black/60 dark:text-alice-blue/60">
                  <Icon name="creditCard" size={16} className="inline mr-1" />
                  Method: {payment.payment_method}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-rich-black dark:text-alice-blue">
              ₹{parseFloat(payment.amount_paid).toLocaleString()}
            </p>
            {payment.late_fine > 0 && (
              <p className="text-sm text-[#E74C3C] mt-1">
                (includes ₹{parseFloat(payment.late_fine).toLocaleString()} fine)
              </p>
            )}
            <span className="inline-block mt-2 px-3 py-1 bg-[#00B894]/20 text-[#00B894] text-xs font-bold rounded-full">
              PAID
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-rich-black/10 dark:border-alice-blue/10">
          <button
            onClick={async () => {
              try {
                await api.downloadReceipt(payment.id)
                alert('✅ Receipt downloaded successfully!')
              } catch (error) {
                alert(`❌ Failed to download receipt: ${error.message}`)
              }
            }}
            className="w-full py-3 bg-baby-blue hover:bg-baby-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
          >
            <Icon name="download" size={20} className="text-white" />
            Download Receipt
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
          <h1 className="text-3xl font-bold text-rich-black dark:text-alice-blue">Fee Payments</h1>
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

        <p className="text-rich-black/60 dark:text-alice-blue/60 mb-8">Manage your payments and dues</p>

        <div className="space-y-8">
          {/* Overdue Fees Section */}
          {overdueFees.length > 0 && (
            <div className="bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl rounded-2xl p-6 border border-[#E74C3C]/30 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-rich-black dark:text-alice-blue flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E74C3C]/10 flex items-center justify-center">
                    <Icon name="exclamationCircle" size={20} className="text-[#E74C3C]" />
                  </div>
                  Overdue Fees
                </h2>
                <span className="px-3 py-1 bg-[#E74C3C]/20 text-[#E74C3C] rounded-full text-sm font-semibold">
                  {overdueFees.length} Overdue
                </span>
              </div>
              <p className="text-rich-black/60 dark:text-alice-blue/60 mb-4 flex items-center gap-2">
                <Icon name="infoCircle" size={16} />
                These payments are past their due date. Additional fines may apply.
              </p>
              <div className="space-y-4">
                {overdueFees.map((fee, index) => renderFee(fee, `overdue_${index}`, true))}
              </div>
            </div>
          )}

          {/* Pending Fees Section */}
          {pendingFees.length > 0 && (
            <div className="bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl rounded-2xl p-6 border border-[#F2C94C]/30 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-rich-black dark:text-alice-blue flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F2C94C]/10 flex items-center justify-center">
                    <Icon name="clock" size={20} className="text-[#F2C94C]" />
                  </div>
                  Pending Fees
                </h2>
                <span className="px-3 py-1 bg-[#F2C94C]/20 text-[#F2C94C] rounded-full text-sm font-semibold">
                  {pendingFees.length} Pending
                </span>
              </div>
              <p className="text-rich-black/60 dark:text-alice-blue/60 mb-4 flex items-center gap-2">
                <Icon name="infoCircle" size={16} />
                Pay before the due date to avoid fines.
              </p>
              <div className="space-y-4">
                {pendingFees.map((fee, index) => renderFee(fee, `pending_${index}`, false))}
              </div>
            </div>
          )}

          {/* Paid Fees Section */}
          {paymentHistory.length > 0 && (
            <div className="bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl rounded-2xl p-6 border border-[#00B894]/30 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-rich-black dark:text-alice-blue flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00B894]/10 flex items-center justify-center">
                    <Icon name="checkCircle" size={20} className="text-[#00B894]" />
                  </div>
                  Payment History
                </h2>
                <span className="px-3 py-1 bg-[#00B894]/20 text-[#00B894] rounded-full text-sm font-semibold">
                  {paymentHistory.length} Paid
                </span>
              </div>
              <div className="space-y-4">
                {paymentHistory.map((payment, index) => renderPayment(payment, `paid_${index}`))}
              </div>
            </div>
          )}

          {/* No Payments */}
          {fees.length === 0 && paymentHistory.length === 0 && (
            <div className="bg-white/80 dark:bg-[#0A2939]/80 backdrop-blur-xl rounded-2xl p-12 border border-rich-black/10 dark:border-alice-blue/10 shadow-lg text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#00B894]/10 flex items-center justify-center">
                <Icon name="checkCircle" size={32} className="text-[#00B894]" />
              </div>
              <p className="text-rich-black/60 dark:text-alice-blue/60 text-lg">No fee payments found!</p>
            </div>
          )}
        </div>
      </motion.div>
      <Navigation />
    </>
  )
}
