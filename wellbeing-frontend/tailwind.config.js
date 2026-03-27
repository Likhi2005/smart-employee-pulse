/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',      // Blue
        secondary: '#A855F7',    // Purple
        accent: '#10B981',       // Green
        background: '#F3F4F6',   // Light Gray
        card: '#FFFFFF',         // White
        text: '#1F2937',         // Dark Gray
      },
      backgroundImage: {
        'gradient-light': 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
        'gradient-blue': 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
        'gradient-purple': 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#1F2937',
            'h1,h2,h3,h4,h5,h6': {
              color: '#111827',
              fontWeight: '600',
            },
          },
        },
      },
    },
  },
  plugins: [],
}