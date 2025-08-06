import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDjango = mode === "django";

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: require("./public/manifest.json"),
        workbox: {
          globPatterns: ["**/*.{js,css,html,png,svg,json}"],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
        },
        devOptions: {
          enabled: mode === "standalone",
        },
      }),
      visualizer({
        filename: "./dist/bundle-analysis.html",
        open: false,
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@theme": path.resolve(__dirname, "../../theme/static_src"),
      },
    },
    build: {
      outDir: isDjango ? "../static/floorplanner/js" : "dist",
      minify: "esbuild",
      sourcemap: mode !== "production",
      cssCodeSplit: true,
      rollupOptions: {
        output: isDjango
          ? {
              entryFileNames: "floorplanner.js",
              chunkFileNames: "floorplanner-[name].js",
              assetFileNames: (assetInfo) => {
                if (assetInfo.name && assetInfo.name.endsWith(".css")) {
                  return "floorplanner.css";
                }
                return "assets/[name].[ext]";
              },
            }
          : {
              entryFileNames: "assets/[name]-[hash].js",
              chunkFileNames: "assets/[name]-[hash].js",
              assetFileNames: "assets/[name]-[hash].[ext]",
            },
      },
      treeshake: true,
    },
    server: {
      port: 5173,
      host: true, // Allow external connections
      proxy: isDjango
        ? {
            "/api": "http://localhost:3000",
            "/ws": {
              target: "ws://localhost:3000",
              ws: true,
            },
          }
        : undefined,
    },
    define: {
      // Make environment variables available
      __APP_VERSION__: JSON.stringify(
        process.env.npm_package_version || "1.0.0"
      ),
    },
  };
});
