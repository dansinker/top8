/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme colors
        'pink': {
          bg: 'rgba(232, 177, 227, 0.6)',
          header: '#da03d0',
          text: '#2b0425',
          logo: '#740764'
        },
        'dark-blue': {
          bg: 'rgba(23, 42, 58, 0.5)',
          header: '#ffffff',
          text: '#000000',
          logo: '#0d1589'
        },
        'almond': {
          bg: 'rgba(217, 197, 178, 0.57)',
          header: '#c57d00',
          text: '#000000',
          logo: '#764d05'
        },
        'vampire': {
          bg: 'rgba(0, 0, 0, 0.5)',
          header: '#6e0505',
          text: '#f5efef',
          logo: '#6e0505'
        },
        'toxic': {
          bg: 'rgba(229, 255, 0, 0.71)',
          header: '#0b6533',
          text: '#000000',
          logo: '#073e1a'
        },
        'shoes': {
          bg: 'rgba(255, 0, 247, 0.71)',
          header: '#000000',
          text: '#afef9b',
          logo: 'rgba(255, 0, 247, 0.71)'
        },
        'angels': {
          bg: 'rgba(152, 225, 243, 0.71)',
          header: 'rgba(172, 243, 204, 0.78)',
          text: '#3a0d30',
          logo: 'rgba(172, 243, 204, 0.77)'
        },
        'night': {
          bg: '#3a0d30',
          header: '#bb4100',
          text: '#afafaf',
          logo: '#bb4100'
        },
        'pastel': {
          bg: '#ffd4f6',
          header: '#65335c',
          text: '#afafaf',
          logo: '#65335c'
        }
      }
    },
  },
  plugins: [],
}
