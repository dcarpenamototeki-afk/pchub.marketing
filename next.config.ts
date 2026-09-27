import type { NextConfig } from "next";

const liveApiOrigin = process.env.LOCAL_LIVE_API_ORIGIN;
if (liveApiOrigin && new URL(liveApiOrigin).origin !== "https://pchub-marketing.vercel.app") {
  throw new Error("LOCAL_LIVE_API_ORIGIN must point to the PC Hub production app.");
}

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: liveApiOrigin
        ? ["posts", "team"].map(resource => ({ source: `/api/${resource}`, destination: `https://pchub-marketing.vercel.app/api/${resource}` }))
        : [],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
