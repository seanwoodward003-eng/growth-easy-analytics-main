import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
      },
      colors: {
        cyber: {
          bg: "#0a0f2c",
          card: "#0f1a3d",
          neon: "#00ffff",
          green: "#2ecc71",
          red: "#e74c3c",
        },
      },
      boxShadow: {
        "cyber-glow": "0 0 30px rgba(0, 255, 255, 0.7)",
      },
    },
  },
  plugins: [],
};

export default config;