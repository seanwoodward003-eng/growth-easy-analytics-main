import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'cyber-bg': '#0a0f2c',
        'cyber-card': '#0f1a3d',
        'cyber-neon': '#00ffff',
        'cyber-green': '#2ecc71',
        'cyber-red': '#e74c3c',
      },
    },
  },
};

export default config;