/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0284c7',
          700: '#0369a1',
        },
        whatsapp: {
          DEFAULT: '#25D366',
          dark: '#1da851',
          light: '#dcf8c6'
        },
        agency: {
          teal: '#0d9488',
          'teal-light': '#ccfbf1',
          purple: '#7c3aed',
          'purple-light': '#f3e8ff',
          amber: '#f59e0b',
          'amber-light': '#fef3c7',
          coral: '#f97316',
          'coral-light': '#ffedd5',
          rose: '#f43f5e',
          'rose-light': '#ffe4e6',
          emerald: '#10b981',
          'emerald-light': '#d1fae5',
          indigo: '#4f46e5',
          'indigo-light': '#e0e7ff',
          bg: '#f8fafc'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 12px -2px rgba(0, 0, 0, 0.04), 0 1px 3px -1px rgba(0, 0, 0, 0.02)',
        'glow': '0 0 20px -5px rgba(124, 58, 237, 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
