import { copyFileSync } from "node:fs"
import { resolve } from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

function spaFallback() {
  return {
    name: "spa-fallback",
    closeBundle() {
      const dist = resolve("dist")
      copyFileSync(resolve(dist, "index.html"), resolve(dist, "404.html"))
    },
  }
}

export default defineConfig({
  base: "/",
  plugins: [react(), spaFallback()],
})
