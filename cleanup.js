const fs = require('fs');
const path = require('path');

// List of files and folders to remove from the root directory
// because they have been moved to src/ or public/
const itemsToRemove = [
  'App.tsx',
  'index.tsx',
  'types.ts',
  'constants.ts',
  'components', // folder
  'utils',      // folder
  'index.html'  // root index.html (moved to public/)
];

console.log('--- Cleaning up duplicate files ---');

itemsToRemove.forEach(item => {
  const itemPath = path.join(__dirname, item);
  if (fs.existsSync(itemPath)) {
    try {
      fs.rmSync(itemPath, { recursive: true, force: true });
      console.log(`✅ Removed: ${item}`);
    } catch (err) {
      console.error(`❌ Failed to remove ${item}: ${err.message}`);
    }
  } else {
    console.log(`⚪ Already gone: ${item}`);
  }
});

console.log('\n--- Cleanup Complete ---');
console.log('Project structure is now clean.');
