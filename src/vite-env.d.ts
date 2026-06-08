/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_GITHUB_CLIENT_ID?: string
  readonly VITE_GITHUB_OAUTH_CALLBACK_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
