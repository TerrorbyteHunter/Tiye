/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        'primary': '#1a1a1a',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 