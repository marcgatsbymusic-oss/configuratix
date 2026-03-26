import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src');
let replacedFiles = 0;

// Old Brand Gold: #dca95c
// New Bright Gold: #eab676
// Old Hover Gold (was #eab676): #f3c47f

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // First, shift the existing hover color up so it doesn't collide
  content = content.replace(/eab676/g, 'F3C47F');
  content = content.replace(/EAB676/g, 'F3C47F');
  
  // Then replace the main brand gold with the brighter Gold
  content = content.replace(/dca95c/g, 'eab676');
  content = content.replace(/DCA95C/g, 'eab676');

  if (content !== original) {
    fs.writeFileSync(file, content);
    replacedFiles++;
  }
});

console.log(`Brightened gold color in ${replacedFiles} files.`);
