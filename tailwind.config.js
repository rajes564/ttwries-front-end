module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // TGTWREIS brand palette — extracted from logo
        purple: {
          50:  '#f5edfb',
          100: '#e8d5f5',
          200: '#d0aaea',
          300: '#b37dd8',
          400: '#8f4cc0',
          500: '#6b2a9e',
          600: '#46166b',   // primary brand purple
          700: '#3a1059',
          800: '#2d0b47',
          900: '#1e0730',
        },
        gold: {
          100: '#fffbe6',
          200: '#fff3b0',
          300: '#ffe066',
          400: '#ffd84d',   // primary brand gold
          500: '#f7c81a',   // deeper gold
          600: '#e0a800',
          700: '#b8860b',
        },
        crimson: {
          400: '#e85555',
          500: '#c0392b',   // banner red
          600: '#a93226',
          700: '#922b21',
        },
        royalblue: {
          500: '#1a4a8a',
          600: '#163d75',
        },
        // Keep primary pointing to purple for btn-primary etc.
        primary: {
          50:  '#f5edfb',
          100: '#e8d5f5',
          200: '#d0aaea',
          300: '#b37dd8',
          400: '#8f4cc0',
          500: '#6b2a9e',
          600: '#46166b',
          700: '#3a1059',
          800: '#2d0b47',
          900: '#1e0730',
        },
        accent: {
          orange: '#e65100',
          gold:   '#ffd84d',
          amber:  '#f7c81a',
          red:    '#c0392b',
        }
      },
      fontFamily: { nunito: ['Nunito', 'sans-serif'] }
    }
  },
  plugins: []
}