// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
  // Add other variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
