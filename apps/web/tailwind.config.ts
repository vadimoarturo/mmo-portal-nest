import type { Config } from "tailwindcss";
import tailwindScrollbar from "tailwind-scrollbar";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./core/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./helpers/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        mb: { max: "767px" },
        xl: { max: "1535px" },
        xxl: { max: "1999px" },
        "not-mb": "768px",
        "not-xl": "1536px",
        "not-xxl": "2000px",
      },
      fontFamily: {
        manrope: ["Manrope", "sans-serif"],
        fairfax: ["var(--font-fairfax)"],
        mono: ["var(--font-plex-mono)"],
      },
      colors: {
        yellow: {
          DEFAULT: "#EDC271",
        },
        white: {
          DEFAULT: "#FFFFFF",
          1: "#EBEBEB",
          2: "#E0E0E0",
          50: "#FFFFFF80",
        },
        green: {
          DEFAULT: "#71ED9D",
          1: "#3EF67F",
          2: "#38E374",
          3: "#00FF5A",
        },
        gray: {
          DEFAULT: "#9CA3AF",
          1: "#333333",
          2: "#5C5C5C",
          3: "#424447",
          4: "#2C2C2C",
          20: "#9CA3AF33",
          25: "#9CA3AF40",
          30: "#9CA3AF4D",
          35: "#9CA3AF59",
          50: "#9CA3AF80",
        },
        black: {
          DEFAULT: "#000000",
          blur: "#000000BF",
          1: "#1B1B1B",
          3: "#161616",
          2: "#101010",
          35: "#00000059",
          25: "#00000040",
          50: "#00000080",
          80: "#1B1B1BCC",
        },
        red: {
          DEFAULT: "#FF0000",
        },
      },
    },
  },
  plugins: [tailwindScrollbar],
} satisfies Config;
