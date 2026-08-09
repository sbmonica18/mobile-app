/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './screens/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#0B1F2A',
        mist: '#E8F1F4',
        teal: '#1F6F78',
        sand: '#D4A574',
        fog: '#6B8490',
      },
    },
  },
  plugins: [],
};
