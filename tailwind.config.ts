import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#0d9488',
          tealDark: '#0f766e',
          cream: '#f0f9f8',
          gold: '#d4a017',
        },
      },
    },
  },
  plugins: [],
};

export default config;
