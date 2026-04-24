/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        display: ["'Sora'", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#eef5ff",
          100: "#d9e9ff",
          200: "#bcd6ff",
          300: "#8dbbff",
          400: "#5793ff",
          500: "#2e6aff",
          600: "#1a4ff5",
          700: "#1340e1",
          800: "#1635b5",
          900: "#18318e",
          950: "#131f57",
        },
      },
    },
  },
  plugins: [],
};
