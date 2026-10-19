/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        soil: {
          50: '#FAF6F0',
          100: '#F1E8DC',
          200: '#E6D5C3',
          500: '#8B6447',
          700: '#5A3E2B',
          900: '#2B1D14',
        },
        leaf: {
          100: '#E3EFE2',
          300: '#9CC5A1',
          500: '#4C8A5E',
          700: '#2F5D43',
          900: '#1F3B2C',
        },
        ember: {
          100: '#F6DDD5',
          500: '#C8553D',
          700: '#8E3524',
        },
        water: {
          100: '#DCEBF3',
          500: '#3B7EA1',
          700: '#285A75',
        },
        sun: {
          100: '#F8EBC4',
          400: '#E3B23C',
        },
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        body: ['"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
