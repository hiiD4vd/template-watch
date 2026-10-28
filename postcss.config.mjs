/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    './scripts/postcss-watch-assets.cjs': {},
    tailwindcss: {},
  },
};

export default config;
