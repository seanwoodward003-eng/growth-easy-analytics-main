import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
      },
      colors: {
        neon: "#00ffff",
        dark: "#0a0f2c",
      },
      animation: {
        glitch: "glitch 1.5s infinite",
      },
      keyframes: {
        glitch: {
          "0%,100%": { textShadow: "0 0 10px #00ffff" },
          "25%": { textShadow: "-2px 0 #e74c3c, 2px 0 #2ecc71" },
          "50%": { textShadow: "2px -2px #9b59b6, -2px 2px #f1c40f" },
          "75%": { textShadow: "-2px 0 #00ffff, 2px 0 #ff00ff" },
        },
      },
    },
  },
  plugins: [],
};
export default config;