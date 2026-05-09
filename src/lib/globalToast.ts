/**
 * Global toast utility for components that don't have access to React state.
 * Creates a DOM-based toast notification that auto-dismisses.
 * Use this in tool components that can't receive showToast as a prop.
 */

type ToastType = 'success' | 'error' | 'warning' | 'info';

const TOAST_COLORS: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: 'linear-gradient(135deg, #059669, #10b981)', icon: '✅' },
  error:   { bg: 'linear-gradient(135deg, #dc2626, #ef4444)', icon: '❌' },
  warning: { bg: 'linear-gradient(135deg, #d97706, #f59e0b)', icon: '⚠️' },
  info:    { bg: 'linear-gradient(135deg, #2563eb, #3b82f6)', icon: 'ℹ️' },
};

let toastCounter = 0;

export function globalToast(message: string, type: ToastType = 'info', duration = 3000) {
  const id = `global-toast-${++toastCounter}`;
  const colors = TOAST_COLORS[type] || TOAST_COLORS.info;

  const el = document.createElement('div');
  el.id = id;
  el.setAttribute('role', 'alert');
  el.innerHTML = `
    <div style="
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      background: ${colors.bg}; color: white;
      padding: 12px 20px; border-radius: 14px;
      font-family: 'Inter', system-ui, sans-serif; font-weight: 600; font-size: 13px;
      z-index: 9999; display: flex; align-items: center; gap: 10px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      backdrop-filter: blur(12px);
      animation: toastSlideIn 0.35s cubic-bezier(0.21,1.02,0.73,1) forwards;
      max-width: 90vw;
      border: 1px solid rgba(255,255,255,0.15);
    ">
      <span style="font-size: 16px;">${colors.icon}</span>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(el);

  setTimeout(() => {
    const toast = document.getElementById(id);
    if (toast) {
      toast.style.animation = 'toastSlideOut 0.25s ease-in forwards';
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}
