import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useGenogramStore } from './store/genogramStore'
import * as firestore from './services/firestore'

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Root element not found!</div>';
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    
    // Setup online/offline sync
    firestore.setupOnlineOfflineSync();
    
    // Export for testing/debugging
    if (import.meta.env.DEV) {
      (window as any).genogramStore = { useGenogramStore };
      (window as any).firestoreService = firestore;
      console.log('✅ Dev tools available: window.genogramStore, window.firestoreService');
      console.log('✅ Offline/online sync initialized');
    }
  } catch (error) {
    console.error('React render error:', error);
    document.body.innerHTML = `<div style="color: red; padding: 20px;">Error: ${error}</div>`;
  }
}
