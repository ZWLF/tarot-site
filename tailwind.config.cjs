/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#eac382',
        'primary-container': '#cda869',
        'on-primary': '#422c00',
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#d1c5b5',
        'surface-container-lowest': '#0e0e0e',
        'surface-container-low': '#1c1b1b',
        'surface-container': '#201f1f',
        'surface-container-high': '#2a2a2a',
        'surface-container-highest': '#353534',
        outline: '#9a8f81',
        'outline-variant': '#4e4639',
      },
      fontFamily: {
        headline: ['Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'serif'],
        body: ['Inter', 'PingFang SC', 'Noto Sans SC', 'sans-serif'],
        label: ['Inter', 'PingFang SC', 'Noto Sans SC', 'sans-serif'],
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.75rem',
        '3xl': '2.25rem',
      },
      boxShadow: {
        ambient: '0 20px 40px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
