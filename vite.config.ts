import { defineConfig } from "vite";
import { resolve } from "path";
import  react from "@vitejs/plugin-react";
import buildContentScript from "./build-content-script";

const srcRoot = resolve(__dirname, "src")
const publicDir = resolve(__dirname, "public")
const outDir = resolve(__dirname, "dist")

export default defineConfig({
   resolve: {
    alias: {
        "@common": resolve(srcRoot, "common"),
    },
   },
   plugins: [react(), buildContentScript()],
   publicDir,
   build: {
    outDir,
     // think about emptyOutDir
    //  emptyOutDir: false,
    //  sourcemap: false,
     rollupOptions: {
        input: {
            "background": resolve(srcRoot, "background", "background.ts"),
        },
        output: {
            entryFileNames: (chunk) =>  `${chunk.name}/${chunk.name}.js`,
        },
     },
     
   } 
})