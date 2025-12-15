import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/i18n'

// Remove loading skeleton and hero skeleton after React mounts
const loader = document.getElementById('app-loader');
const heroSkeleton = document.getElementById('hero-skeleton');

// Fade out loading overlay immediately
if (loader) {
  loader.classList.add('hidden');
  setTimeout(() => loader?.remove(), 300);
}

// Keep hero skeleton briefly to prevent flash, then remove when React renders
setTimeout(() => {
  if (heroSkeleton) {
    heroSkeleton.style.opacity = '0';
    heroSkeleton.style.transition = 'opacity 0.2s ease-out';
    setTimeout(() => heroSkeleton?.remove(), 200);
  }
}, 100);

createRoot(document.getElementById("root")!).render(<App />);
