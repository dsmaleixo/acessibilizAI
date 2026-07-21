/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Supabase Storage: projeto hospedado + stack local (supabase start)
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};

export default nextConfig;
