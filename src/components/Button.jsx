import React from 'react';
import { motion } from 'motion/react';

/**
 * Button component with multiple variants and states
 * @param {string} variant - Button variant: 'primary', 'secondary', or 'ghost'
 * @param {boolean} loading - Loading state
 * @param {boolean} disabled - Disabled state
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Button content
 * @param {function} onClick - Click handler
 */
const Button = ({ 
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  children,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'px-6 py-3 font-semibold rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: `
      bg-picton-blue hover:bg-picton-blue-600 
      text-white 
      shadow-lg hover:shadow-xl
      disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none
    `,
    secondary: `
      bg-baby-blue hover:bg-baby-blue-600 
      text-white 
      shadow-lg hover:shadow-xl
      disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none
    `,
    ghost: `
      bg-transparent 
      border-2 border-picton-blue 
      text-picton-blue dark:text-picton-blue-400 
      hover:bg-picton-blue/10
      disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed
    `,
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </motion.button>
  );
};

export default Button;
