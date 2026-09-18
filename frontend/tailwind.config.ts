import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cloudflare-inspired color palette
        primary: {
          50: '#FFF5EB',
          100: '#FFE8CC',
          200: '#FFD099',
          300: '#FFB066',
          400: '#FF8C33',
          500: '#F6821F', // Main Cloudflare orange
          600: '#E06B18',
          700: '#C45412',
          800: '#A04311',
          900: '#823611',
        },
        dark: {
          50: '#F6F7F9',
          100: '#E6E8EE',
          200: '#CCCFD8',
          300: '#9AA0AE',
          400: '#6B7285',
          500: '#4B5563',
          600: '#374151',
          700: '#2D3342',
          800: '#1F2937',
          900: '#1D1F2F', // Main dark background
          950: '#11141D',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#40445C',
        },
        border: {
          light: '#E6E8EE',
          dark: '#4B5563',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '8px',
        'md': '10px',
        'lg': '12px',
      },
      boxShadow: {
        'soft': '0 8px 24px rgba(29, 31, 47, 0.08)',
        'soft-hover': '0 12px 32px rgba(29, 31, 47, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config