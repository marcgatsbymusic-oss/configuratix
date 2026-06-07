import fs from 'fs';
import path from 'path';

const filePath = 'C:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/pages/DebugPricing.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Regex to find F100TViewer block regardless of spacing or line endings (\r\n vs \n)
const regex = /<F100TViewer\r?\n\s+width=\{width\}\r?\n\s+height=\{height\}\r?\n\s+colorExt=\{extDetails\.hex\}\r?\n\s+colorInt=\{intDetails\.hex\}\r?\n\s+colorExtTexture=\{extDetails\.textureUrl\}\r?\n\s+colorIntTexture=\{intDetails\.textureUrl\}\r?\n\s+hidePill=\{true\}\r?\n\s+\/>/;

const match = content.match(regex);
if (match) {
  console.log("Found F100TViewer block!");
  const matched = match[0];
  const isCrlf = matched.includes('\r\n');
  const lineEnding = isCrlf ? '\r\n' : '\n';
  
  const replacement = matched.replace(
    /hidePill=\{true\}/,
    `onSceneReady={handleSceneReady}${lineEnding}                      hidePill={true}`
  );
  
  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully patched DebugPricing.tsx!");
} else {
  console.error("F100TViewer block not found in file!");
}
