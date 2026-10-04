/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F97316',
          dark: '#EA580C',
          light: '#FFF7ED',
          hover: '#FB923C'
        },
        surface: '#FFFFFF',
        textMain: '#171717',
        textSecondary: '#737373',
        borderLight: '#E5E7EB',
        success: '#16A34A',
        danger: '#DC2626'
      }
    },
  },
  plugins: [],
}
