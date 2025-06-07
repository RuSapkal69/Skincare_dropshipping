/** @type {import('tailwindcss').Config} */
export const content = [
  "./admin/src/**/*.{js,jsx,ts,tsx}",
  "./client/src/**/*.{js,jsx,ts,tsx}",
  "./index.html"
];
export const darkMode = "class";
export const theme = {
  extend: {
    colors: {
      primary: {
        DEFAULT: "#4F46E5",
        dark: "#4338CA",
        light: "#E0E7FF",
      },
    },
  },
};
export const plugins = [];