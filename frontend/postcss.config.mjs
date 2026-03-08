/** @type {import('postcss-load-config').Config} */
const config = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
