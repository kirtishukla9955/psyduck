/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B3D66',
          dark: '#082B49',
          light: '#1B5B8E',
        },
        secondary: {
          DEFAULT: '#B5622F',
          dark: '#934E24',
          light: '#D38353',
        },
        gis: {
          DEFAULT: '#0E7C7B',
          dark: '#0A5A59',
          light: '#14A3A2',
        },
        status: {
          success: '#1E7A34',
          'success-bg': '#E6F4EA',
          warning: '#B7791B',
          'warning-bg': '#FEF3D6',
          error: '#B23A2E',
          'error-bg': '#FCE8E6',
          info: '#2C5FA8',
          'info-bg': '#E8F0FE',
        },
        neutral: {
          50: '#F7F8FA',
          100: '#EEF0F4',
          200: '#E1E4EA',
          300: '#C9CED8',
          400: '#9DA5B4',
          500: '#6E7687',
          600: '#4E5463',
          700: '#343843',
          800: '#23262E',
          900: '#1A1D21',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '"Noto Sans Devanagari"', '"Noto Sans Tamil"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        input: '4px',
        btn: '4px',
        card: '8px',
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.05)',
        elevated: '0 4px 12px rgba(0, 0, 0, 0.08)',
        modal: '0 12px 32px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
