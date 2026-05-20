import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#f4efe4",
        ink: "#181612",
        ember: "#bb5a2a",
        moss: "#5d7b4f",
        steel: "#4d6674",
        night: "#151923",
      },
    },
  },
  plugins: [],
};

export default config;
