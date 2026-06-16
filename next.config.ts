import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build robusto su DB free-tier: il long tail è ISR on-demand; alziamo
  // comunque il timeout di generazione statica per sicurezza.
  staticPageGenerationTimeout: 180,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "yt3.ggpht.com" },
      { protocol: "https", hostname: "*.ggpht.com" },
      { protocol: "https", hostname: "i.scdn.co" },
    ],
  },
};

export default nextConfig;
