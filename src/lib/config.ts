// GitHub repository that hosts this fork's releases.
// Change this if you publish releases from a different account/repository.
const GITHUB_REPO = "biglorange/transmission-next-ui"

export const APP_CONFIG = {
  // Injected by Vite at build time (see vite.config.ts). Release builds use the
  // git tag / workflow version; local builds fall back to package.json.
  version: __APP_VERSION__,
  githubRepo: GITHUB_REPO,
  githubUrl: `https://github.com/${GITHUB_REPO}`,
  name: "Transmission Next",
}
