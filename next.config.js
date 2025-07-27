/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@supabase/supabase-js"],
  images: {
    domains: ["qaffkgieedvgpswjqwbm.supabase.co"],
    unoptimized: true,
  },
}

module.exports = nextConfig
