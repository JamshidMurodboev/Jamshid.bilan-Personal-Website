import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      colors: {
        paper: {
          DEFAULT: '#f6f3ec',
          soft: '#efeadf',
          card: '#fffdf8',
        },
        ink: {
          DEFAULT: '#131210',
          soft: '#44403a',
          muted: '#857f74',
        },
        ember: {
          50: '#fbe8dd',
          100: '#f7d4c0',
          300: '#f59e6b',
          500: '#f97341',
          600: '#dd5a1f',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        night: {
          DEFAULT: '#12110e',
          soft: '#181713',
          card: '#1c1a16',
          border: '#2c2922',
        },
        // Legacy brand aliases — kept so nothing breaks if referenced
        brand: {
          teal: '#c2410c',
          tealDark: '#9a3412',
          cream: '#f6f3ec',
          gold: '#c9a227',
        },
      },
    },
  },
  plugins: [],
};

export default config;
