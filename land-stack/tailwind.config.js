/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0f1a2e",
          800: "#1a2740",
          700: "#2a3b5a",
        },
        accent: {
          orange: "#ff5722",
          cyan: "#00bcd4",
        },
        zone: {
          residential: "#2196f3",
          commercial: "#ffc107",
          agricultural: "#4caf50",
          industrial: "#9c27b0",
        },
      },
    },
  },
  plugins: [],
};
