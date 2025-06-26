const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/__v0_sw.js',
        destination: '/api/__v0_sw',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/__v0_sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
