const config = {
  plugins: [
    "@tailwindcss/postcss",
    // Add autoprefixer for better browser support
    "autoprefixer",
    // Add CSSNano for minification in production
    process.env.NODE_ENV === "production" ? "cssnano" : null,
  ].filter(Boolean),
};

export default config;