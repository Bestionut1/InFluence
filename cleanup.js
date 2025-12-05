// Quick cleanup script - run in browser console to delete all genograms
// window.cleanupGenograms()

window.cleanupGenograms = async function() {
  console.log('🗑️ Starting cleanup...');
  
  // Clear all localStorage
  const keys = Object.keys(localStorage);
  let localCount = 0;
  for (const key of keys) {
    if (key.startsWith('genogram-')) {
      localStorage.removeItem(key);
      localCount++;
      console.log('Deleted from localStorage:', key);
    }
  }
  console.log(`✅ Cleared ${localCount} items from localStorage`);
  
  // Note: Firestore cleanup requires backend - export the deleteAllUserGenograms from firestore.ts
  console.log('📝 To delete from Firestore, run this in DevTools after importing:');
  console.log('import { deleteAllUserGenograms } from "./src/services/firestore"');
  console.log('await deleteAllUserGenograms()');
};

console.log('Cleanup script loaded! Run: window.cleanupGenograms()');
