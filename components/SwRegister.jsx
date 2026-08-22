'use client';

import { useEffect } from 'react';

export default function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silent fail — PWA install just won't be available offline.
      });
    }
  }, []);

  return null;
}
