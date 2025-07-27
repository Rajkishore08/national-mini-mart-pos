/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  images: {
    domains: ['localhost'],
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  // Enable static optimization
  staticPageGenerationTimeout: 120,
  // Optimize bundle size
  webpack: (config, { dev, isServer }) => {
    // Optimize for production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    return config
  },
}

module.exports = nextConfig
