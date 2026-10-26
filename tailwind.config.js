/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ZTS master palette (Creative Strategy v1.2, section 10)
        zts: {
          midnight: '#102A43',
          blue: '#1D9BF0',
          orange: '#F28C28',
          white: '#F7FAFC',
          graphite: '#263238',
        },
      },
      fontFamily: {
        display: ['ui-rounded', '"Nunito"', '"Trebuchet MS"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        drift: {
          '0%': { strokeDashoffset: '400' },
          '100%': { strokeDashoffset: '0' },
        },
        cardin: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'cardin-back': {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        drift: 'drift 6s ease-out forwards',
        floaty: 'floaty 4s ease-in-out infinite',
        cardin: 'cardin 0.3s ease-out',
        'cardin-back': 'cardin-back 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
