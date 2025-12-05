// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager
} from "firebase/firestore";

// Your web app's Firebase configuration
// Values are loaded from environment variables (see .env.local.example)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate that all required Firebase config values are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
for (const key of requiredKeys) {
  if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
    throw new Error(`Missing Firebase config: ${key}. Please check your .env.local file and refer to .env.local.example`);
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with modern persistent cache configuration
// This replaces the deprecated enableIndexedDbPersistence() method
// persistentLocalCache: Enables offline data persistence using IndexedDB
// persistentSingleTabManager: Ensures single-tab mode to avoid conflicts
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager({ forceOwnership: true })
  })
});

// Track offline persistence state
// Modern API (initializeFirestore with persistentLocalCache) automatically enables persistence
export const persistenceEnabled = true;

// Log persistence initialization status
if (import.meta.env.DEV) {
  console.log('[Firebase] ✅ Offline persistence enabled (via modern LocalCache API)');
}
