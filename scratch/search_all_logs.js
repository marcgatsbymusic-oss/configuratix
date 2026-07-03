import fs from 'fs';
import path from 'path';

const brainDir = 'C:/Users/Shadow/.gemini/antigravity/brain';
const subdirs = fs.readdirSync(brainDir).filter(name => {
  return fs.statSync(path.join(brainDir, name)).isDirectory();
});

for (const d of subdirs) {
  for (const filename of ['transcript_full.jsonl', 'transcript.jsonl']) {
    const p = path.join(brainDir, d, '.system_generated', 'logs', filename);
    if (!fs.existsSync(p)) continue;
    
    const content = fs.readFileSync(p, 'utf-8');
    if (content.includes('generate_full_colored_svg.mjs')) {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('generate_full_colored_svg.mjs') && line.includes('write_to_file')) {
          try {
            const obj = JSON.parse(line);
            if (obj.tool_calls) {
              for (const tc of obj.tool_calls) {
                if (tc.name === 'write_to_file' && tc.args.TargetFile) {
                  console.log(`Found TargetFile: ${tc.args.TargetFile} in ${p} at line ${i}`);
                }
              }
            }
          } catch (err) {}
        }
      }
    }
  }
}
