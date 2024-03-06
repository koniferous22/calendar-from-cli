/** @type {import('tailwindcss').Config} */
export default {
  content: ['./lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      translate: {
        200: '200%',
        300: '300%',
        400: '400%',
        500: '500%',
        600: '600%',
        700: '700%',
        800: '800%',
        900: '900%',
        1000: '1000%',
      },
    },
    animation: {
      'spin-fast': 'spin 0.5s linear infinite',
      'spin-standard': 'spin 1s linear infinite',
      'spin-slow': 'spin 3s linear infinite',
    },
  },
  plugins: [],
}
