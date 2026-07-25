import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  basePath: "/taiwan-food-safety",
  generateBuildId: async () => process.env.NEXT_BUILD_ID ?? process.env.GITHUB_SHA ?? "local-build",
  trailingSlash: true,
  output: isGitHubPagesBuild ? "export" : undefined,
  typescript: {
    tsconfigPath: isGitHubPagesBuild ? "tsconfig.pages.json" : "tsconfig.json",
  },
};

export default nextConfig;
