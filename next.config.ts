import type { NextConfig } from "next";

// Sin cacheComponents: cada pantalla depende de la sesión y los permisos del usuario,
// así que todo se renderiza por petición.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
