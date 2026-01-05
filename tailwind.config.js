/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /(bg|border|text)-(cyan|purple|gray)-(100|300|400|500|700|800|900)/,
    },
    {
      pattern: /(from|via|to)-(cyan|purple|gray)-(400|500|900)\/(30|50|70|80|90)/,
    },
    'backdrop-blur-md',
    'backdrop-blur-xl',
    'animate-pulse',
    'drop-shadow-2xl',
    'bg-gradient-to-r',
    'bg-gradient-to-t',
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
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
      },
      // Safe area support for iPhone notch/home bar
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
};