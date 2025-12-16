/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/charts/**/*.{js,ts,jsx,tsx}",  // ONLY chart components
    "./src/app/(dashboard)/**/*.{js,ts,jsx,tsx}",    // If charts are in tab pages
    "./src/components/ui/**/*.{js,ts,jsx,tsx}",      // Any chart wrapper UI
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#0a0f2c",
          card: "#0f1a3d",
          neon: "#00ffff",
        },
      },
    },
  },
  plugins: [],
}