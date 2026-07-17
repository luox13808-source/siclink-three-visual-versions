import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        space: "#030507",
        neural: "#00A8FF",
        silicon: "#FF8A00",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Noto Sans SC",
          "PingFang SC",
          "Microsoft YaHei",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
