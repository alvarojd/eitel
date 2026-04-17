// utils/environment.ts — Detección centralizada del entorno de ejecución

export const isLocalEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;

  const host = window.location.hostname;
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.startsWith('192.168.')
  ) {
    return true;
  }

  // Vite dev mode fallback
  try {
    return !!(import.meta as any).env?.DEV;
  } catch {
    return false;
  }
};
