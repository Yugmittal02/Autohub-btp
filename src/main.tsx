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

// === PWA AUTO-UPDATE SYSTEM ===
// When developer deploys a new build, the app updates automatically
// without requiring reinstall. Uses "autoUpdate" strategy.
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  // Automatically apply updates - no confirm dialog needed
  onNeedRefresh() {
    // Show a brief toast-like notification, then auto-reload
    const banner = document.createElement('div');
    banner.id = 'update-banner';
    banner.innerHTML = `
      <div style="
        position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white; padding: 14px 24px; border-radius: 16px;
        font-family: 'Inter', sans-serif; font-weight: 700; font-size: 13px;
        z-index: 9999; display: flex; align-items: center; gap: 12px;
        box-shadow: 0 10px 40px rgba(99,102,241,0.4);
        animation: slideUp 0.35s cubic-bezier(0.21,1.02,0.73,1) forwards;
        max-width: 90vw;
      ">
        <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
          ✨
        </div>
        <div>
          <div style="margin-bottom: 2px;">New Update Available!</div>
          <div style="font-size: 11px; opacity: 0.8; font-weight: 500;">Applying automatically...</div>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    // Auto-apply update after 2 seconds
    setTimeout(() => {
      updateSW(true); // Force update & reload
    }, 2000);
  },
  onOfflineReady() {
    console.log("✅ App is ready to work offline");
  },
  // Check for updates frequently
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      // Check for updates every 60 seconds
      setInterval(() => {
        registration.update();
      }, 60 * 1000);

      // Also check when app comes back online
      window.addEventListener('online', () => {
        registration.update();
      });

      // Also check on visibility change (when user switches back to app)
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && navigator.onLine) {
          registration.update();
        }
      });
    }
  },
});