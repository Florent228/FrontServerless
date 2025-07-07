/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENFAAS_URL: string
  readonly VITE_OPENFAAS_NAMESPACE: string
  readonly VITE_FUNCTION_PASSWORD_GENERATOR: string
  readonly VITE_FUNCTION_2FA_GENERATOR: string
  readonly VITE_FUNCTION_USER_AUTH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 