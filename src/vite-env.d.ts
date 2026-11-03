/// <reference types="vite/client" />

// Replaced at build time by Vite (see vite.config.ts).
declare const __APP_VERSION__: string

declare module "@fontsource/*" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any
  export default content
}
