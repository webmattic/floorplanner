/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_ENABLE_AUTH: string
  readonly VITE_AUTH_PROVIDER: string
  readonly VITE_ENABLE_COLLABORATION: string
  readonly VITE_ENABLE_3D_VIEW: string
  readonly VITE_ENABLE_EXPORT: string
  readonly VITE_ENABLE_CAD_IMPORT: string
  readonly VITE_STORAGE_TYPE: string
  readonly VITE_AUTO_SAVE_INTERVAL: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_MOCK_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}