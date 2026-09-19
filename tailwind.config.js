/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#F1F3F5',
          dark: '#111827',
        },
        brand: {
          DEFAULT: '#172554',
          light: '#2563EB',
        },
        status: {
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
        },
        text: {
          primary: '#172554',
          secondary: '#3B5998',
        },
        border: {
          DEFAULT: '#E2E8F0',
        },
      },
    },
  },
  plugins: [],
};
