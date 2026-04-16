import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "front-end", "src"),
      "@shared": path.resolve(import.meta.dirname, "database"),
      "@api": path.resolve(import.meta.dirname, "back-end", "api-routes.ts"),
    },
  },
  root: path.resolve(import.meta.dirname, "front-end"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
