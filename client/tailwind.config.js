const widthHeight = {};
for (let i = 1; i <= 1000; i++) {
  widthHeight[`${i}px`] = `calc(${i}px * var(--img-scale))`;
}

module.exports = {
  content: ["./public/**/*.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        bg: "#202020",
        "bg-light": "#565656",
        "t-main": "#FFFFFF",
        "t-sub": "#CCCCCC",
        "s-blue": "#0061FF",
        "s-cyan": "#00DDFF",
        "s-green": "#26FE1E",
        "s-orange": "#FF8A01",
        "s-pink": "#FE00B8",
        "s-purple": "#8A00FF",
        "s-red": "#FF0200",
        "s-yellow": "#FEFF01",
      },
      width: {
        ...widthHeight,
      },
      height: {
        ...widthHeight,
      },
      fontFamily: {
        main: "'Press Start 2P', monospace",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
