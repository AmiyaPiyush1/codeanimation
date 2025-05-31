/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Ultra-Modern CodeStream Palette
        'navy': {
          50: '#F0F4FF',
          100: '#E0E9FF',
          200: '#C7D7FE',
          300: '#A5BCFC',
          400: '#8B9CF8',
          500: '#7C7CF3',
          600: '#6D5FEB',
          700: '#5B4ED6',
          800: '#4A3FB0',
          900: '#0F172A',
          950: '#020617',
        },
        'blue': {
          50: '#EBF8FF',
          100: '#BEE3F8',
          200: '#90CDF4',
          300: '#63B3ED',
          400: '#4299E1',
          500: '#3182CE',
          600: '#2B77CB',
          700: '#2C5AA0',
          800: '#2A4365',
          900: '#1A365D',
        },
        'emerald': {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        'purple': {
          50: '#FAF5FF',
          100: '#E9D8FD',
          200: '#D6BCFA',
          300: '#B794F6',
          400: '#9F7AEA',
          500: '#805AD5',
          600: '#6B46C1',
          700: '#553C9A',
          800: '#44337A',
          900: '#322659',
        },
        'cyan': {
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        'slate': {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        }
      },
      fontFamily: {
        'code': ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        'display': ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'SF Pro Text', 'system-ui', 'sans-serif'],
      },
      animation: {
        // Ultra-smooth spring animations
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 1s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-left': 'slideInLeft 1s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slideInRight 1s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-gentle': 'bounceGentle 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'float-subtle': 'floatSubtle 4s ease-in-out infinite',
        'float-reverse': 'floatReverse 5s ease-in-out infinite',
        'glow-soft': 'glowSoft 2s ease-in-out infinite alternate',
        'glow-intense': 'glowIntense 3s ease-in-out infinite alternate',
        'typewriter': 'typewriter 4s steps(40) infinite',
        'gradient-shift': 'gradientShift 8s ease-in-out infinite',
        'particle-float': 'particleFloat 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'rotate-slow': 'rotateSlow 20s linear infinite',
        'rotate-reverse': 'rotateReverse 15s linear infinite',
        'morph': 'morph 6s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'magnetic': 'magnetic 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        floatSubtle: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(12px) rotate(-2deg)' },
        },
        glowSoft: {
          '0%': { 
            boxShadow: '0 0 20px rgba(124, 124, 243, 0.2), 0 0 40px rgba(124, 124, 243, 0.1)',
            filter: 'brightness(1)',
          },
          '100%': { 
            boxShadow: '0 0 30px rgba(124, 124, 243, 0.4), 0 0 60px rgba(124, 124, 243, 0.2)',
            filter: 'brightness(1.1)',
          },
        },
        glowIntense: {
          '0%': { 
            boxShadow: '0 0 30px rgba(34, 211, 238, 0.3), 0 0 60px rgba(34, 211, 238, 0.1)',
          },
          '100%': { 
            boxShadow: '0 0 50px rgba(34, 211, 238, 0.6), 0 0 100px rgba(34, 211, 238, 0.3)',
          },
        },
        typewriter: {
          '0%': { width: '0%' },
          '50%': { width: '100%' },
          '100%': { width: '0%' },
        },
        gradientShift: {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
            filter: 'hue-rotate(0deg)',
          },
          '25%': { 
            backgroundPosition: '50% 0%',
            filter: 'hue-rotate(90deg)',
          },
          '50%': { 
            backgroundPosition: '100% 50%',
            filter: 'hue-rotate(180deg)',
          },
          '75%': { 
            backgroundPosition: '50% 100%',
            filter: 'hue-rotate(270deg)',
          },
        },
        particleFloat: {
          '0%, 100%': { 
            transform: 'translateY(0px) translateX(0px) scale(1)',
            opacity: '0.6',
          },
          '33%': { 
            transform: 'translateY(-20px) translateX(10px) scale(1.1)',
            opacity: '1',
          },
          '66%': { 
            transform: 'translateY(10px) translateX(-5px) scale(0.9)',
            opacity: '0.8',
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%) skewX(-15deg)' },
          '100%': { transform: 'translateX(200%) skewX(-15deg)' },
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        rotateReverse: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        morph: {
          '0%, 100%': { 
            borderRadius: '20px',
            transform: 'scale(1) rotate(0deg)',
          },
          '33%': { 
            borderRadius: '50px',
            transform: 'scale(1.05) rotate(120deg)',
          },
          '66%': { 
            borderRadius: '30px',
            transform: 'scale(0.95) rotate(240deg)',
          },
        },
        breathe: {
          '0%, 100%': { 
            transform: 'scale(1)',
            filter: 'brightness(1)',
          },
          '50%': { 
            transform: 'scale(1.03)',
            filter: 'brightness(1.1)',
          },
        },
        magnetic: {
          '0%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-5px) scale(1.02)' },
          '100%': { transform: 'translateY(0px) scale(1)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
        '4xl': '72px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': 'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 1) 0%, transparent 0%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 1) 0%, transparent 50%), radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 1) 0%, transparent 50%), radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 1) 0%, transparent 50%), radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 1) 0%, transparent 50%), radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 1) 0%, transparent 50%), radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 1) 0%, transparent 50%)',
        'neural-grid': 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%237C7CF3" fill-opacity="0.05"%3E%3Cpath d="M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        'dot-grid': 'radial-gradient(circle, rgba(124, 124, 243, 0.1) 1px, transparent 1px)',
        'animated-mesh': 'linear-gradient(-45deg, #7C7CF3, #22D3EE, #10B981, #9F7AEA)',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'large': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'ultra': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(124, 124, 243, 0.1)',
        'blue-glow': '0 0 20px rgba(124, 124, 243, 0.15), 0 0 40px rgba(124, 124, 243, 0.08)',
        'blue-glow-lg': '0 0 30px rgba(124, 124, 243, 0.3), 0 0 60px rgba(124, 124, 243, 0.15)',
        'emerald-glow': '0 0 20px rgba(16, 185, 129, 0.15), 0 0 40px rgba(16, 185, 129, 0.08)',
        'emerald-glow-lg': '0 0 30px rgba(16, 185, 129, 0.3), 0 0 60px rgba(16, 185, 129, 0.15)',
        'cyan-glow': '0 0 20px rgba(34, 211, 238, 0.15), 0 0 40px rgba(34, 211, 238, 0.08)',
        'cyan-glow-lg': '0 0 30px rgba(34, 211, 238, 0.3), 0 0 60px rgba(34, 211, 238, 0.15)',
        'purple-glow': '0 0 20px rgba(159, 122, 234, 0.15), 0 0 40px rgba(159, 122, 234, 0.08)',
        'purple-glow-lg': '0 0 30px rgba(159, 122, 234, 0.3), 0 0 60px rgba(159, 122, 234, 0.15)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 25px -5px rgba(124, 124, 243, 0.1), 0 8px 16px -8px rgba(124, 124, 243, 0.1)',
        'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 20px rgba(124, 124, 243, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};