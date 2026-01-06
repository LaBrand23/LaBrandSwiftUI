import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../shared/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Text
        text: {
          primary: '#1A1A1A',
          secondary: '#333333',
          tertiary: '#666666',
          muted: '#999999',
          inverted: '#FFFFFF',
        },
        // Backgrounds
        background: {
          primary: '#FAFAFA',
          surface: '#FFFFFF',
          secondary: '#F5F5F5',
          editorial: '#1A1A1A',
          dark: '#0D0D0D',
        },
        // Borders
        border: {
          primary: '#E8E8E8',
          subtle: '#F0F0F0',
          focus: '#1A1A1A',
        },
        // Accents
        accent: {
          gold: '#C4A77D',
          sale: '#C41E3A',
          success: '#2E7D32',
          error: '#C41E3A',
          warning: '#F59E0B',
          info: '#3B82F6',
        },
        // Button colors
        button: {
          primary: {
            bg: '#1A1A1A',
            text: '#FFFFFF',
          },
          secondary: {
            bg: '#FFFFFF',
            text: '#1A1A1A',
          },
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display-1': ['36px', { lineHeight: '1.2', letterSpacing: '0.02em' }],
        'display-2': ['24px', { lineHeight: '1.3', letterSpacing: '0.04em' }],
        'display-3': ['20px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        'heading': ['22px', { lineHeight: '1.4', letterSpacing: '0.06em' }],
        'body': ['15px', { lineHeight: '1.6' }],
        'caption': ['13px', { lineHeight: '1.5' }],
        'micro': ['10px', { lineHeight: '1.4', letterSpacing: '0.03em' }],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'dropdown': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'modal': '0 8px 32px rgba(0, 0, 0, 0.16)',
      },
      borderRadius: {
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
