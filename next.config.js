/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        // When frontend calls /api/..., it sends it to the Python server
        source: "/api/:path*",
        destination: "http://0.0.0.0:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig; // This is the "ES Module" way to export
