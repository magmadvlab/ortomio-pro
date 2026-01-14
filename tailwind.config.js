/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Green Colors (definiti anche in @theme nel CSS)
        'ortomio-green': {
          50: 'var(--color-ortomio-green-50)',
          100: 'var(--color-ortomio-green-100)',
          200: 'var(--color-ortomio-green-200)',
          300: 'var(--color-ortomio-green-300)',
          400: 'var(--color-ortomio-green-400)',
          500: 'var(--color-ortomio-green-500)',
          600: 'var(--color-ortomio-green-600)',
          700: 'var(--color-ortomio-green-700)',
          800: 'var(--color-ortomio-green-800)',
          900: 'var(--color-ortomio-green-900)',
        },
        // Earth/Terra Colors
        'ortomio-earth': {
          50: 'var(--color-ortomio-earth-50)',
          100: 'var(--color-ortomio-earth-100)',
          200: 'var(--color-ortomio-earth-200)',
          300: 'var(--color-ortomio-earth-300)',
          400: 'var(--color-ortomio-earth-400)',
          500: 'var(--color-ortomio-earth-500)',
          600: 'var(--color-ortomio-earth-600)',
          700: 'var(--color-ortomio-earth-700)',
          800: 'var(--color-ortomio-earth-800)',
          900: 'var(--color-ortomio-earth-900)',
        },
        // Seasonal Colors
        'season': {
          spring: 'var(--color-season-spring)',
          summer: 'var(--color-season-summer)',
          autumn: 'var(--color-season-autumn)',
          winter: 'var(--color-season-winter)',
        },
        // Semantic Colors
        'semantic': {
          success: 'var(--color-semantic-success)',
          warning: 'var(--color-semantic-warning)',
          error: 'var(--color-semantic-error)',
          info: 'var(--color-semantic-info)',
        },
      },
      fontFamily: {
        display: ['DM Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['2rem', { lineHeight: '2.5rem' }],
        '4xl': ['2.5rem', { lineHeight: '3rem' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
      },
    },
  },
  plugins: [],
}

