import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDjango = mode === 'django';
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@theme": path.resolve(__dirname, "../../theme/static_src"),
      },
    },
    build: {
      outDir: isDjango ? "../static/floorplanner/js" : "dist",
      rollupOptions: {
        output: isDjango ? {
          entryFileNames: "floorplanner.js",
          chunkFileNames: "floorplanner-[name].js",
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith(".css")) {
              return "floorplanner.css";
            }
            return "assets/[name].[ext]";
          },
        } : {
          // Standard Vite output for standalone
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
    },
    server: {
      port: 5173,
      host: true, // Allow external connections
      proxy: isDjango ? {
        "/api": "http://localhost:3000",
        "/ws": {
          target: "ws://localhost:3000",
          ws: true,
        },
      } : undefined,
    },
    define: {
      // Make environment variables available
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },
  };
});
