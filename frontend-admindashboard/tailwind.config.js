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
        primary: {
          DEFAULT: '#F6821F',
          hover: '#E8751A',
          light: '#FFF4EB',
          dark: '#C46618',
        },
        dark: {
          DEFAULT: '#1D1F2F',
          lighter: '#25283D',
          card: '#40445C',
          border: '#2D3046',
        },
        light: {
          DEFAULT: '#FFFFFF',
          bg: '#F6F7F9',
          card: '#FFFFFF',
          border: '#E6E8EE',
        },
        gray: {
          50: '#F6F7F9',
          100: '#E6E8EE',
          200: '#D1D5DB',
          300: '#9CA3AF',
          400: '#6B7280',
          500: '#4B5563',
          600: '#374151',
          700: '#1F2937',
          800: '#111827',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '8': '8px',
        '10': '10px',
        '12': '12px',
        '16': '16px',
      },
      boxShadow: {
        'soft': '0 8px 24px rgba(29, 31, 47, 0.08)',
        'soft-dark': '0 8px 24px rgba(0, 0, 0, 0.24)',
        'card': '0 2px 8px rgba(29, 31, 47, 0.04)',
        'card-hover': '0 8px 24px rgba(29, 31, 47, 0.08)',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}