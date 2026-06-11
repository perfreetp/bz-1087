/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1200px',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#FFF4EB',
          100: '#FFE6D1',
          200: '#FFCDA3',
          300: '#FFB375',
          400: '#FF9A47',
          500: '#FF8C42',
          600: '#E67329',
          700: '#B35920',
          800: '#804016',
          900: '#4D260D',
        },
        secondary: {
          50: '#EFFBF9',
          100: '#D5F5F1',
          200: '#ABEBE3',
          300: '#81E1D5',
          400: '#57D7C7',
          500: '#4ECDC4',
          600: '#3BA99C',
          700: '#2C7D74',
          800: '#1D524D',
          900: '#0F2926',
        },
        accent: {
          50: '#EBF7FB',
          100: '#CCEBF5',
          200: '#99D6EB',
          300: '#66C1E1',
          400: '#33ADD7',
          500: '#45B7D1',
          600: '#2E90A8',
          700: '#226C7E',
          800: '#174854',
          900: '#0B242A',
        },
        warm: {
          50: '#FFF8F0',
          100: '#FFF0E0',
          200: '#FFE1C0',
          300: '#FFD2A1',
          400: '#FFC381',
          500: '#FFB462',
        },
      },
      fontFamily: {
        display: ['"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        body: ['"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'float': '0 12px 40px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'bounce-soft': 'bounce-soft 2s infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulse-soft 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
