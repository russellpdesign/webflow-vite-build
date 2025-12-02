import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: path.resolve(__dirname, "src/pages/home.js"),
        about: path.resolve(__dirname, "src/pages/about.js"),
        project1: path.resolve(__dirname, "src/pages/donovan-mitchell.js"),
      },
      output: {
        entryFileNames: "js/[name].js",
        chunkFileNames: "js/chunk-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  }
});
