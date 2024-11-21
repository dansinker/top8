import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export", // Enable static exports
    images: {
        unoptimized: true, // Required for static export
    },
    // Since we're doing client-side routing, we don't need trailing slash
    trailingSlash: false,
};

export default nextConfig;
