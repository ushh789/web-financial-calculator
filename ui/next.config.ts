import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    const backend = process.env.BACKEND_URL ?? "http://localhost:8080";
    return {
      // beforeFiles — виконується ДО перевірки файлів/Route Handlers,
      // інакше App Router повертає 404 для /api/* не доходячи до rewrite
      beforeFiles: [
        { source: "/api/:path*", destination: `${backend}/api/:path*` },
        { source: "/auth/:path*", destination: `${backend}/auth/:path*` },
      ],
    };
  },
};

export default withNextIntl(nextConfig);
