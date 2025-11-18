import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import Icon from './Icon';

const Toast = ({ 
  id,
  type = 'info', 
  message, 
  onClose,
  duration = 4000,
  position = 'top-right'
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const variants = {
    success: {
      gradient: 'from-green-500 to-green-600',
      icon: 'check',
      bgColor: 'bg-green-500/90',
    },
    error: {
      gradient: 'from-red-500 to-red-600',
      icon: 'x',
      bgColor: 'bg-red-500/90',
    },
    warning: {
      gradient: 'from-baby-blue-400 to-baby-blue-500',
      icon: 'exclamation',
      bgColor: 'bg-baby-blue-400/90',
    },
    info: {
      gradient: 'from-picton-blue-500 to-picton-blue-600',
      icon: 'info',
      bgColor: 'bg-picton-blue-500/90',
    },
  };

  const config = variants[type] || variants.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={`
        relative
        min-w-[320px] max-w-[400px]
        p-4
        rounded-xl
        backdrop-blur-xl
        ${config.bgColor}
        border border-white/30
        shadow-2xl
        flex items-start gap-3
        text-white
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <Icon 
          name={config.icon} 
          size={20} 
          color="white" 
          strokeWidth={2}
        />
      </div>

      {/* Message */}
      <div className="flex-1 text-sm font-medium leading-relaxed">
        {message}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors duration-200"
        aria-label="Close notification"
      >
        <Icon 
          name="x" 
          size={16} 
          color="white" 
          strokeWidth={2}
        />
      </button>
    </motion.div>
  );
};

export default Toast;
