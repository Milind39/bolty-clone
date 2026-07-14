import { useEffect, useState } from 'react';
import { WebContainer } from '@webcontainer/api';

// 1. Module-level variable persists outside React lifecycle
let webContainerPromise: Promise<WebContainer> | null = null;

export function useWebContainer() {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);

  useEffect(() => {
    // 2. Only boot if it hasn't been started yet
    if (!webContainerPromise) {
      webContainerPromise = WebContainer.boot();
    }

    // 3. Attach to the existing promise
    webContainerPromise
      .then((instance) => {
        setWebcontainer(instance);
      })
      .catch((err) => {
        console.error("WebContainer boot error:", err);
        // Reset the promise if booting failed so it can be retried
        webContainerPromise = null;
      });
  }, []); // Run once on mount

  return webcontainer;
}