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
declare module 'react-dom/client' {
  interface Root {
    render(children: any): void
    unmount(): void
  }
  export function createRoot(container: Element | DocumentFragment, options?: any): Root
  export function hydrateRoot(container: Element | DocumentFragment, initialChildren: any, options?: any): Root
}

