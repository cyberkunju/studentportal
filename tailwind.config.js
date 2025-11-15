/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Legacy primary color (kept for backward compatibility during migration)
        primary: '#137fec',
        
        // New Design System Color Palette
        gunmetal: {
          DEFAULT: '#2a2d34',
          50: '#f5f5f6',
          100: '#e6e6e8',
          200: '#cccdd1',
          300: '#a8aab1',
          400: '#7d8089',
          500: '#5f626c',
          600: '#4d4f58',
          700: '#3b3d43',
          800: '#2a2d34',
          900: '#1f2126',
        },
        'lavender-blush': {
          DEFAULT: '#eee5e9',
          50: '#fdfcfd',
          100: '#faf8f9',
          200: '#f6f2f4',
          300: '#f2ecef',
          400: '#eee5e9',
          500: '#d9cdd3',
          600: '#c4b5bd',
          700: '#9d8a94',
          800: '#76606b',
          900: '#4f3642',
        },
        'celestial-blue': {
          DEFAULT: '#009ddc',
          50: '#e6f7ff',
          100: '#b3e5ff',
          200: '#80d4ff',
          300: '#4dc2ff',
          400: '#1ab0ff',
          500: '#009ddc',
          600: '#007db0',
          700: '#005d84',
          800: '#003e58',
          900: '#001e2c',
        },
        'giants-orange': {
          DEFAULT: '#f26430',
          50: '#fff4f0',
          100: '#ffe0d6',
          200: '#ffccbd',
          300: '#ffb8a3',
          400: '#ffa48a',
          500: '#f26430',
          600: '#d94e1a',
          700: '#c03a0a',
          800: '#8a2a07',
          900: '#541a04',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'fade-in-slow': 'fadeIn 0.3s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
