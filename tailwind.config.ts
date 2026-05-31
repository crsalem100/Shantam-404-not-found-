import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Citizen-style near-black app surfaces
        app: {
          black: "#08090d",
          950: "#0c0e14",
          900: "#11141d",
          850: "#161a26",
          800: "#1c2130",
          700: "#262d40",
          600: "#323b52",
        },
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          400: "#4d97ff",
          500: "#1f7aff",
          600: "#0a5fe0",
          700: "#0a4bb0",
        },
        priority: {
          low: "#22c55e",
          medium: "#eab308",
          high: "#f97316",
          urgent: "#ef4444",
        },
        live: "#3b82f6", // user location blue dot
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        phone: "0 30px 80px -20px rgba(0,0,0,0.7)",
        glow: "0 0 0 4px rgba(31,122,255,0.15)",
      },
      maxWidth: {
        phone: "440px",
      },
    },
  },
  plugins: [],
};

export default config;
