import fs from 'fs';

const logPath = 'C:/Users/Shadow/.gemini/antigravity/brain/924642f5-417b-4fb8-b030-eb848f366f8f/.system_generated/logs/transcript.jsonl';
const content = fs.readFileSync(logPath, 'utf-8');
const lines = content.split('\n');
const line = lines[108]; // 108 index is line 109, let's verify line index

// Let's find line containing generate_full_colored_svg.mjs around index 108
let targetLine = null;
for (let i = 100; i < 120; i++) {
  if (lines[i] && lines[i].includes('generate_full_colored_svg.mjs') && lines[i].includes('write_to_file')) {
    targetLine = lines[i];
    console.log(`Found matching line at index ${i}`);
    break;
  }
}

if (targetLine) {
  const obj = JSON.parse(targetLine);
  if (obj.tool_calls) {
    for (const tc of obj.tool_calls) {
      if (tc.name === 'write_to_file') {
        const code = tc.args.CodeContent;
        if (code) {
          console.log(`Code length: ${code.length}`);
          if (code.includes('<truncated')) {
            console.log("Warning: Code contains '<truncated'!");
          }
          fs.writeFileSync('scratch/generate_full_colored_svg_found.js', code, 'utf-8');
          console.log("Wrote code to scratch/generate_full_colored_svg_found.js");
        }
      }
    }
  }
} else {
  console.log("No matching line found around index 108.");
}
