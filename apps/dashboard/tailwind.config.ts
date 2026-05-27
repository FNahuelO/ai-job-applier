import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(240 10% 3.9%)',
        foreground: 'hsl(0 0% 98%)',
        card: 'hsl(240 10% 6%)',
        border: 'hsl(240 5% 18%)',
        muted: 'hsl(240 5% 64.9%)',
        primary: 'hsl(262 83% 58%)',
        secondary: 'hsl(189 94% 43%)',
        success: 'hsl(142 76% 36%)',
        warning: 'hsl(41 96% 40%)',
        destructive: 'hsl(0 84.2% 60.2%)'
      },
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.28)'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem'
      }
    }
  },
  plugins: []
};

export default config;
