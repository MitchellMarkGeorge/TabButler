import { PluginOption, build } from "vite";
import { resolve } from "path";

const packages = [
  {
    content: resolve(__dirname, "src/content/content.ts"),
  },
];

const outDir = resolve(__dirname, "dist");
const srcRoot = resolve(__dirname, "src");

export default function buildContentScript(): PluginOption {
  return {
    name: "build-content-script",
    async buildEnd() {
      for (const _package of packages) {
        await build({
          resolve: {
            alias: {
              "@common": resolve(srcRoot, "common"),
            },
          },
          publicDir: false,
          build: {
            outDir,
            rollupOptions: {
              input: _package,
              output: {
                entryFileNames: (chunk) => {
                  return `${chunk.name}/content.js`;
                },
              },
            },
          },
          configFile: false,
        });
      }
    },
  };
}
