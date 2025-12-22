/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,rs}"],
  theme: {
    fontFamily: {
      sans: ["Space Mono", "monospace"],
    },
  },
  plugins: [],
  variants: {
    extend: {
      display: ["group-focus"],
    },
  },
};
