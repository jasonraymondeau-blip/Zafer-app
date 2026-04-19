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
        // Palette Zafer
        primary: "#404040",
        "primary-dark": "#272727",
        background: "#FFFFFF",
        card: "#F5F5F5",
        "text-main": "#1A1A1A",
        "text-muted": "#888888",
      },
      borderRadius: {
        zafer: "12px",
      },
      fontFamily: {
        sans: ["Inter", "DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
