import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Hum '!' use nahi karenge, hum proper check lagayenge
const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  // Dismiss native splash screen after React mounts
  requestAnimationFrame(() => {
    const splash = document.getElementById('app-splash');
    if (splash) {
      splash.classList.add('hide');
      setTimeout(() => splash.remove(), 500);
    }
  });
}

import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App is ready to work offline");
  },
});