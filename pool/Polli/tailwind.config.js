/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito-Regular", "sans-serif"],
        "nunito-bold": ["Nunito-Bold", "sans-serif"],
        "nunito-italic": ["Nunito-Italic", "sans-serif"],
        "nunito-light": ["Nunito-Light", "sans-serif"],
        "nunito-medium": ["Nunito-Medium", "sans-serif"],
        "nunito-semibold": ["Nunito-SemiBold", "sans-serif"],
        "nunito-extrabold": ["Nunito-ExtraBold", "sans-serif"],
      },
      colors: {
        // `primary` remains for existing classes such as `bg-primary`.
        primary: "#5E5CE6",
        brand: {
          DEFAULT: "#5E5CE6",
          strong: "#4947C8",
          soft: "#EEEDFF",
          subtle: "#F7F7FF",
        },
        surface: {
          canvas: "#F8FAFC",
          DEFAULT: "#FFFFFF",
          muted: "#F1F5F9",
          raised: "#FFFFFF",
        },
        ink: {
          strong: "#172033",
          DEFAULT: "#334155",
          muted: "#64748B",
          disabled: "#94A3B8",
          inverse: "#FFFFFF",
        },
        line: {
          DEFAULT: "#CBD5E1",
          subtle: "#E2E8F0",
          strong: "#94A3B8",
          focus: "#5E5CE6",
        },
        success: {
          DEFAULT: "#15803D",
          soft: "#DCFCE7",
          line: "#86EFAC",
        },
        warning: {
          DEFAULT: "#B45309",
          soft: "#FEF3C7",
          line: "#FCD34D",
        },
        danger: {
          DEFAULT: "#DC2626",
          soft: "#FEE2E2",
          line: "#FCA5A5",
        },
        info: {
          DEFAULT: "#2563EB",
          soft: "#DBEAFE",
          line: "#93C5FD",
        },
      },
    },
  },
  plugins: [],
};
