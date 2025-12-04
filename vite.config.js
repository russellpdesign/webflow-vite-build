import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    hmr: true,
  },

   resolve: {
      alias: {
        "@engine": path.resolve(__dirname, "src/engine"),
        "@sections": path.resolve(__dirname, "src/sections"),
        "@utils": path.resolve(__dirname, "src/engine/utils"),
      }
    },

  build: {
    minify: "terser",
    terserOptions: {
      keep_classnames: true,
      keep_fnames: true,
    },
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
  },
});
