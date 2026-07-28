/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/auth/redirect",
        permanent: false,
      },
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: false,
      },
      {
        source: "/profile",
        destination: "/user/profile",
        permanent: false,
      },
      {
        source: "/user",
        destination: "/user/profile",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '30000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.yuvofitness.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
