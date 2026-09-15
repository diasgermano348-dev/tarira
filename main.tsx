import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe handlers to prevent uncaught exceptions in sandboxed iframe environments
if (typeof window !== 'undefined') {
  window.onerror = function (msg, url, lineNo, columnNo, error) {
    console.warn('[Global Uncaught Exception Intercepted]:', msg, error);
    return true; // Prevents firing the browser default error handler
  };

  window.addEventListener('error', (event) => {
    console.warn('[Global Window Error Intercepted]:', event.message || event.error);
    if (event.preventDefault) event.preventDefault();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    console.warn('[Global Unhandled Rejection Intercepted]:', event.reason);
    if (event.preventDefault) event.preventDefault();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
  });

  // Guard window.alert and window.confirm against sandboxed iframe DOMExceptions
  const rawAlert = window.alert;
  window.alert = (msg?: any) => {
    try {
      if (window.self === window.top && rawAlert) {
        rawAlert.call(window, msg);
      } else {
        console.info('[Portal Alert]:', msg);
      }
    } catch {
      console.info('[Portal Alert]:', msg);
    }
  };

  const rawConfirm = window.confirm;
  window.confirm = (msg?: any) => {
    try {
      if (window.self === window.top && rawConfirm) {
        return rawConfirm.call(window, msg);
      }
      return true;
    } catch {
      console.info('[Portal Confirm]:', msg);
      return true;
    }
  };

  const rawPrompt = window.prompt;
  window.prompt = (msg?: any, defVal?: any) => {
    try {
      if (window.self === window.top && rawPrompt) {
        return rawPrompt.call(window, msg, defVal);
      }
      return defVal || '';
    } catch {
      return defVal || '';
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
