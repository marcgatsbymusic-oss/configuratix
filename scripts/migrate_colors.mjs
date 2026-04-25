import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');

const REPLACEMENTS = [
  { regex: /bg-\[\#111112\]/g, replacement: 'bg-mammut-darker' },
  { regex: /bg-\[\#111\]/g, replacement: 'bg-mammut-darker' },
  { regex: /bg-\[\#1a1a1b\]/g, replacement: 'bg-mammut-dark' },
  { regex: /bg-\[\#151515\]/g, replacement: 'bg-mammut-dark' },
  { regex: /bg-\[\#161617\]/g, replacement: 'bg-mammut-darker' },
  { regex: /bg-\[\#0a0a0a\]/g, replacement: 'bg-black' },
  
  { regex: /border-\[\#2a2a2b\]/g, replacement: 'border-mammut-border' },
  { regex: /border-\[\#3a3a3b\]/g, replacement: 'border-mammut-border' },
  
  { regex: /text-\[\#eab676\]/g, replacement: 'text-mammut-gold' },
  { regex: /border-\[\#eab676\]/g, replacement: 'border-mammut-gold' },
  { regex: /bg-\[\#eab676\]/g, replacement: 'bg-mammut-gold' },
  { regex: /focus\:border-\[\#eab676\]/g, replacement: 'focus:border-mammut-gold' },
  { regex: /hover\:border-\[\#eab676\]/g, replacement: 'hover:border-mammut-gold' },
  { regex: /hover\:text-\[\#eab676\]/g, replacement: 'hover:text-mammut-gold' },
  { regex: /text-\[\#888888\]/g, replacement: 'text-mammut-grey-light' },
  { regex: /hover\:text-\[\#fbbf24\]/g, replacement: 'hover:text-yellow-500' },
  { regex: /text-\[\#fcd34d\]/g, replacement: 'text-yellow-400' },
  
  // also handle some variants with opacity
  { regex: /text-\[\#eab676\]\/(\d+)/g, replacement: 'text-mammut-gold/$1' },
  { regex: /bg-\[\#eab676\]\/(\d+)/g, replacement: 'bg-mammut-gold/$1' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { regex, replacement } of REPLACEMENTS) {
        content = content.replace(regex, replacement);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(SRC_DIR);
console.log("Migration complete!");
