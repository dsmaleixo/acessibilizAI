/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Domínio do Supabase Storage (ajuste após criar o projeto)
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
  },
};

export default nextConfig;
