const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
};

module.exports = nextConfig;
