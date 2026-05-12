import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f8f1',
          100: '#e8f0e4',
          200: '#d1e2c7',
          300: '#b8d4a7',
          400: '#8fb87a',
          500: '#6a9c55',
          600: '#4a7c3f',
          700: '#3a6332',
          800: '#2d4e28',
          900: '#1e3a1b',
        },
        olive: {
          900: '#2c3a2a',
        },
        cream: '#fafcf8',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'float': 'float 5s ease-in-out infinite',
        'float-delayed': 'float-delayed 7s ease-in-out infinite 1s',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 6s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
}
export default config