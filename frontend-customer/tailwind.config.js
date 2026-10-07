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
          DEFAULT: '#3574F0',
          hover: '#2F6FDD',
          light: '#EAF1FF',
          dark: '#1D55BF',
        },
        dark: {
          DEFAULT: '#1E1F22',
          lighter: '#252629',
          card: '#2B2D30',
          border: '#3C3F41',
        },
        light: {
          DEFAULT: '#2B2D30',
          bg: '#1E1F22',
          card: '#2B2D30',
          border: '#3C3F41',
        },
        gray: {
          50: '#F1F3F5',
          100: '#D7DAE0',
          200: '#C4C7CE',
          300: '#9DA0A8',
          400: '#8B8F97',
          500: '#7D8188',
          600: '#C4C7CE',
          700: '#B8BCC4',
          800: '#D7DAE0',
          900: '#F1F3F5',
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
        'soft': '0 10px 32px rgba(0, 0, 0, 0.28)',
        'soft-dark': '0 10px 32px rgba(0, 0, 0, 0.32)',
        'card': '0 2px 10px rgba(0, 0, 0, 0.16)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.24)',
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
