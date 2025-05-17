/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--cds-text-primary)',
        secondary: 'var(--cds-text-secondary)',
        background: 'var(--cds-background)',
        layer: 'var(--cds-layer-01)',
        'layer-hover': 'var(--cds-layer-hover)',
      },
    },
  },
  important: true,
  corePlugins: {
    preflight: false,
  },
} 