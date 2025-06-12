import type {Config} from 'tailwindcss';
import tailwindColors from 'tailwindcss/colors'; // Import the default colors

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Note: 'container' is kept at the top level as per existing config.
    // If it were intended to extend Tailwind's default container settings,
    // it would also go under 'extend'. For now, this is fine.
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    // All custom color definitions are moved to 'extend.colors'.
    // This ensures Tailwind's default color palette (including 'gray', 'neutral', etc.)
    // is used as the base, which the typography plugin relies on.
    extend: {
      colors: {
        // Explicitly include the default gray palette
        gray: tailwindColors.gray,
        // Your custom HSL-based colors (LinkedIn inspired)
        background: 'hsl(var(--background))', // e.g., 220 20% 97% (Very Light Blue-Gray)
        foreground: 'hsl(var(--foreground))', // e.g., 210 10% 23% (Dark Gray-Blue for text)

        card: {
          DEFAULT: 'hsl(var(--card))', // e.g., 0 0% 100% (White)
          foreground: 'hsl(var(--card-foreground))', // e.g., 210 10% 23% (Dark Gray-Blue)
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))', // e.g., 0 0% 100% (White)
          foreground: 'hsl(var(--popover-foreground))', // e.g., 210 10% 23% (Dark Gray-Blue)
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))', // e.g., 210 89% 40% (LinkedIn Blue)
          foreground: 'hsl(var(--primary-foreground))', // e.g., 0 0% 100% (White)
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))', // e.g., 210 25% 94% (Lighter Gray-Blue)
          foreground: 'hsl(var(--secondary-foreground))', // e.g., 210 89% 40% (Primary Blue for text on secondary)
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))', // e.g., 210 25% 94% (Same as secondary)
          foreground: 'hsl(var(--muted-foreground))', // e.g., 210 10% 45% (Medium Gray-Blue)
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))', // e.g., 200 80% 50% (A slightly lighter, vibrant blue for accents)
          foreground: 'hsl(var(--accent-foreground))', // e.g., 0 0% 100% (White)
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))', // e.g., 0 75% 50% (Standard Red)
          foreground: 'hsl(var(--destructive-foreground))', // e.g., 0 0% 98% (Light Foreground for destructive)
        },
        border: 'hsl(var(--border))', // e.g., 210 20% 88% (Light Gray-Blue Border)
        input: 'hsl(var(--input))', // e.g., 210 20% 88% (Same as border for input)
        ring: 'hsl(var(--ring))', // e.g., 210 89% 50% (Primary Blue for rings)

        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      fontFamily: {
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
        headline: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
        code: ['monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography')
  ],
} satisfies Config;
