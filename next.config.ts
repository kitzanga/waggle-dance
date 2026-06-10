import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mammoth", "jszip", "pdf-parse", "readable-stream"],
};

export default nextConfig;
