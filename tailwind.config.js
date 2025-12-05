/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Psychology/Genealogy themed palette
        primary: {
          50: '#faf8ff',
          100: '#f3f0ff',
          200: '#ede4ff',
          300: '#dccfff',
          400: '#c7b0ff',
          500: '#a78bfa', // Main accent
          600: '#8b5cf6', // Deeper purple
          700: '#7c3aed', // Deep violet
          800: '#6d28d9', // Rich purple
          900: '#5b21b6', // Very dark purple
        },
        // Secondary - Warm earth/genealogy tones
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24', // Warm gold
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        // Tertiary - Sage/wellness for balance
        teal: {
          50: '#f0fdfa',
          100: '#d1faf5',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Sage/nature
          600: '#0d9488',
          700: '#0f766e',
        },
        // Neutral palette
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Background colors
        bg: {
          dark: '#0f0f1e',    // Deepest dark
          surface: '#1a1a2e',  // Surface layer
          card: '#2d2d44',     // Card background
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        slideInUp: 'slideInUp 0.6s ease-out',
        slideInDown: 'slideInDown 0.6s ease-out',
        scaleIn: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s infinite',
        bounce: 'bounce 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transitionTimingFunction: {
        therapeutic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
