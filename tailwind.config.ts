import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        surface: "#12121A",
        "surface-elevated": "#1A1A25",
        primary: "#6C5CE7",
        "primary-hover": "#5A4BD6",
        "primary-light": "rgba(108, 92, 231, 0.15)",
        success: "#00B894",
        "success-light": "rgba(0, 184, 148, 0.15)",
        error: "#FF6B6B",
        "error-light": "rgba(255, 107, 107, 0.15)",
        warning: "#FDCB6E",
        text: "#E8E8F0",
        "text-secondary": "#9494A8",
        "text-muted": "#5C5C72",
        border: "#2A2A3A",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        "4xs": "2px",
        "3xs": "4px",
        "2xs": "8px",
        xs: "12px",
        sm: "16px",
        md: "24px",
        lg: "32px",
        xl: "40px",
        "2xl": "48px",
        "3xl": "64px",
        "4xl": "80px",
      },
      animation: {
        "flip-y": "flipY 300ms ease-in-out",
        "slide-in": "slideIn 300ms ease-out",
        "fade-in": "fadeIn 200ms ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        flipY: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
        slideIn: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
