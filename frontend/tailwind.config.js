/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode using a class
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Include all relevant files
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2a9d8f', // Teal green
        secondary: '#264653', // Dark green
        accent: '#8d6e63', // Earth brown
        light: '#f4f4f4', // Light background
        dark: '#1e1e1e', // Dark background
        sky: '#87ceeb', // Sky blue
      },
    },
  },
  plugins: [],
};