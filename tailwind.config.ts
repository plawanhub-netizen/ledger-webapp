import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#EDE6D3",
        card: "#FBF8EF",
        ledger: {
          green: "#1F4B3F",
          greenDark: "#16362D",
          blue: "#2C4770",
          red: "#A23B3B",
          gold: "#B08D57",
          line: "#E3DAC0",
        },
        ink: "#2B2620",
        muted: "#8A8168",
      },
      fontFamily: {
        serifThai: ["var(--font-serif-thai)", "serif"],
        sansThai: ["var(--font-sans-thai)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
