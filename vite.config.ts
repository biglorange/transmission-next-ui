import { readFileSync } from "node:fs"
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8")
) as { version: string }

// Release workflows pass the tag/version through VITE_APP_VERSION.
// Strip the optional "v" prefix so the UI renders "v0.4.0" from either source.
const appVersion = (process.env.VITE_APP_VERSION || pkg.version).replace(/^v/, "")

// https://vite.dev/config/
export default defineConfig(() => {
  const isDemo = process.env.VITE_APP_DEMO === 'true'

  return {
    base: "./",
    plugins: [react(), tailwindcss()],
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
    },
    resolve: {
      alias: [
        // If it's a demo build, replace rpc-client with mock version (specific first)
        ...(isDemo ? [
          { find: "@/lib/rpc-client", replacement: path.resolve(__dirname, "./src/lib/rpc-client-mock.ts") },
        ] : []),
        { find: "@", replacement: path.resolve(__dirname, "./src") },
      ],
    },
    server: {
      proxy: {
        "/transmission": {
          target: "http://127.0.0.1:9091",
          changeOrigin: true,
        },
      },
    },
  }
})
