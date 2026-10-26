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
        display: ['"Fredoka Variable"', 'ui-rounded', '"Trebuchet MS"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        drift: { '0%': { strokeDashoffset: '400' }, '100%': { strokeDashoffset: '0' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        cardin: { '0%': { opacity: '0', transform: 'translateX(40px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        'cardin-back': { '0%': { opacity: '0', transform: 'translateX(-40px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        flow: { '0%': { strokeDashoffset: '0' }, '100%': { strokeDashoffset: '-24' } },
        glitch: { '0%,100%': { opacity: '1' }, '20%': { opacity: '.25' }, '40%': { opacity: '.9' }, '55%': { opacity: '.15' }, '70%': { opacity: '1' } },
        shake: {
          '0%,100%': { transform: 'translate(0,0)' },
          '20%': { transform: 'translate(-6px,3px)' },
          '40%': { transform: 'translate(6px,-3px)' },
          '60%': { transform: 'translate(-4px,-2px)' },
          '80%': { transform: 'translate(4px,2px)' },
        },
        breathe: { '0%,100%': { transform: 'scale(.7)', opacity: '.5' }, '50%': { transform: 'scale(1.15)', opacity: '1' } },
        pop: { '0%': { transform: 'scale(.6)', opacity: '0' }, '70%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        pulsering: { '0%': { transform: 'scale(1)', opacity: '.7' }, '100%': { transform: 'scale(1.9)', opacity: '0' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        drift: 'drift 6s ease-out forwards',
        floaty: 'floaty 4s ease-in-out infinite',
        cardin: 'cardin 0.3s ease-out',
        'cardin-back': 'cardin-back 0.3s ease-out',
        flow: 'flow 0.7s linear infinite',
        glitch: 'glitch 1.6s steps(1) infinite',
        shake: 'shake 0.45s ease-in-out',
        breathe: 'breathe 5s ease-in-out infinite',
        pop: 'pop 0.45s ease-out both',
        pulsering: 'pulsering 2s ease-out infinite',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
}
