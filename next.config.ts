import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client', 'bcryptjs', '@prisma/adapter-better-sqlite3', 'better-sqlite3'],
  outputFileTracingIncludes: {
    '/api/**/*': ['./prisma/dev.db'],
    '/*': ['./prisma/dev.db'],
  },
};

export default nextConfig;
