import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  basePath: "/taiwan-food-safety",
  trailingSlash: true,
  output: isGitHubPagesBuild ? "export" : undefined,
  typescript: {
    tsconfigPath: isGitHubPagesBuild ? "tsconfig.pages.json" : "tsconfig.json",
  },
};

export default nextConfig;
