import React from 'react';

/**
 * GlassCard component with glassmorphic styling
 * @param {React.ReactNode} children - Card content
 * @param {string} variant - Glass effect variant: 'standard', 'enhanced', 'subtle', or 'frosted'
 * @param {string} className - Additional CSS classes
 * @param {function} onClick - Optional click handler
 */
const GlassCard = ({ 
  children, 
  variant = 'standard', 
  className = '',
  onClick,
  ...props
}) => {
  const variants = {
    standard: 'bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl',
    enhanced: 'bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl',
    subtle: 'bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg',
    frosted: 'bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl',
  };

  const baseStyles = `
    rounded-2xl 
    border border-white/20 dark:border-gray-700/20 
    shadow-lg
    transition-all duration-300
  `;

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
