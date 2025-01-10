import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#333333', // Dark grey
          foreground: '#FFFFFF' // White
        },
        secondary: {
          DEFAULT: '#666666', // Light grey
          foreground: '#FFFFFF' // White
        },
        accent: {
          DEFAULT: '#FF69B4', // Pink
          foreground: '#FFFFFF' // White
        },
        background: '#F5F5F5', // Off-white
        foreground: '#000000', // Black
        card: {
          DEFAULT: '#444444', // Darker grey
          foreground: '#FFFFFF' // White
        },
        popover: {
          DEFAULT: '#555555', // Medium grey
          foreground: '#FFFFFF' // White
        },
        muted: {
          DEFAULT: '#777777', // Muted grey
          foreground: '#FFFFFF' // White
        },
        destructive: {
          DEFAULT: '#FF0000', // Red
          foreground: '#FFFFFF' // White
        },
        border: '#CCCCCC', // Light grey
        input: '#DDDDDD', // Very light grey
        ring: '#FF69B4', // Pink
        chart: {
          '1': '#FF69B4', // Pink
          '2': '#333333', // Dark grey
          '3': '#666666', // Light grey
          '4': '#444444', // Darker grey
          '5': '#555555' // Medium grey
        }
      },
      fontFamily: {
        sans: [
          'Poppins', // Modern and bold
          'Roboto', // Clean and professional
          'sans-serif'
        ],
        graffiti: [
          'Urbanist',
          'sans-serif'
        ]
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;