/**
 * Test helpers for genogram delete functionality
 * Add to your browser console or run from DevTools
 */

// Make functions available globally
window.testGenogramDelete = async function() {
  console.log('🧪 Starting genogram delete test...');
  
  // Import store and services
  const { useGenogramStore } = window.genogramStore;
  const store = useGenogramStore.getState ? useGenogramStore.getState() : useGenogramStore;
  
  try {
    // Step 1: Create test genogram
    console.log('\n📝 Step 1: Creating test genogram...');
    const genogramId = await store.createNewGenogram('TEST-DELETE-' + Date.now(), 'This is a test genogram to verify deletion');
    console.log('✅ Created test genogram:', genogramId);
    
    // Wait for it to appear
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reload list
    await store.loadAllGenograms();
    let genograms = store.allGenograms;
    console.log(`📊 Genograms in store: ${genograms.length}`);
    
    // Step 2: Check localStorage
    console.log('\n🔍 Step 2: Checking localStorage...');
    const localKey = `genogram-${genogramId}`;
    const inLocal = localStorage.getItem(localKey);
    if (inLocal) {
      console.log('✅ Found in localStorage:', localKey);
    } else {
      console.log('❌ NOT in localStorage:', localKey);
    }
    
    // Step 3: Delete it
    console.log('\n🗑️ Step 3: Deleting test genogram...');
    await store.deleteGenogram(genogramId);
    console.log('✅ Delete command sent');
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Verify deletion
    console.log('\n✅ Step 4: Verifying deletion...');
    await store.loadAllGenograms();
    genograms = store.allGenograms;
    const stillExists = genograms.find(g => g.id === genogramId);
    
    console.log(`\n📊 Final genogram count: ${genograms.length}`);
    if (stillExists) {
      console.log('❌ FAILED: Genogram still in store:', stillExists);
    } else {
      console.log('✅ SUCCESS: Genogram removed from store');
    }
    
    const stillInLocal = localStorage.getItem(localKey);
    if (stillInLocal) {
      console.log('❌ FAILED: Still in localStorage');
    } else {
      console.log('✅ SUCCESS: Removed from localStorage');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
};

window.cleanupAllGenograms = async function() {
  console.log('🗑️ CLEANUP: Deleting all genograms...');
  
  try {
    // Import services
    const firestore = window.firebaseServices;
    
    // Get store
    const { useGenogramStore } = window.genogramStore;
    const store = useGenogramStore.getState ? useGenogramStore.getState() : useGenogramStore;
    
    // Load all genograms
    await store.loadAllGenograms();
    const genograms = store.allGenograms;
    
    console.log(`Found ${genograms.length} genograms to delete`);
    
    // Delete each one
    for (const genogram of genograms) {
      try {
        await store.deleteGenogram(genogram.id);
        localStorage.removeItem(`genogram-${genogram.id}`);
        console.log(`✅ Deleted: ${genogram.title}`);
      } catch (err) {
        console.error(`❌ Failed to delete ${genogram.id}:`, err);
      }
    }
    
    // Clear localStorage
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('genogram-')) {
        localStorage.removeItem(key);
      }
    }
    
    console.log('✅ Cleanup complete!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

console.log('✅ Test helpers loaded!');
console.log('Run: window.cleanupAllGenograms() - to delete all genograms');
console.log('Run: window.testGenogramDelete() - to test create + delete flow');
