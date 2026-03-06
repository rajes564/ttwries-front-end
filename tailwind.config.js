module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#2e7d32',
          600: '#1b5e20',
          700: '#145214',
          800: '#0d3b0d',
          900: '#082308'
        },
        accent: {
          orange: '#e65100',
          gold:   '#ffd600',
          amber:  '#ff8f00'
        }
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif']
      }
    }
  },
  plugins: []
}
