/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// CSS module declarations
declare module '*.css' {
  const content: string
  export default content
}

declare module '*.scss' {
  const content: string
  export default content
}

// React DOM client types
// @types/react-dom may not include react-dom/client, so we declare it here
declare module 'react-dom/client' {
  import type { ReactNode } from 'react'
  
  interface Root {
    render(children: ReactNode): void
    unmount(): void
  }
  
  export function createRoot(
    container: Element | DocumentFragment,
    options?: {
      identifierPrefix?: string
      onRecoverableError?: (error: unknown) => void
    }
  ): Root
  
  export function hydrateRoot(
    container: Element | DocumentFragment,
    initialChildren: ReactNode,
    options?: {
      onRecoverableError?: (error: unknown) => void
    }
  ): Root
}

