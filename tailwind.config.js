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
        navy: {
          950: '#070B14',
          900: '#0B1120',
          850: '#0E1726',
          800: '#111C30',
          750: '#16233B',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
        },
        brand: {
          blue: '#2563EB',
          cyan: '#06B6D4',
          teal: '#14B8A6',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-blue': '0 0 25px -5px rgba(37, 99, 235, 0.35)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'scan': 'scanLine 3s ease-in-out infinite',
        'conveyor': 'conveyor 12s linear infinite',
        'float': 'floatBox 4s ease-in-out infinite',
      },
      keyframes: {
        scanLine: {
          '0%, 100%': { top: '5%', opacity: '0.8' },
          '50%': { top: '92%', opacity: '1' },
        },
        conveyor: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        floatBox: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
};
