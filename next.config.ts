import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "font-src 'self' https://k2mkucxia43oc7fa.public.blob.vercel-storage.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;