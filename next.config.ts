import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGitHubPages ? "/deutsch-tests" : "",
  assetPrefix: isGitHubPages ? "/deutsch-tests/" : "",
  images: { unoptimized: true },
};

export default nextConfig;
