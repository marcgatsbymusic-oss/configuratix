import fs from 'fs';
import readline from 'readline';

const transcriptPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\1402b35e-6e35-4b2b-85d7-4c14038c258f\\.system_generated\\logs\\transcript.jsonl';

const fileStream = fs.createReadStream(transcriptPath);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let step = 0;
for await (const line of rl) {
  step++;
  if (step < 540 || step > 612) continue;
  let data;
  try {
    data = JSON.parse(line);
  } catch (e) {
    continue;
  }
  
  if (data.tool_calls) {
    for (const tc of data.tool_calls) {
      if (tc.name === 'replace_file_content' || tc.name === 'write_to_file' || tc.name === 'multi_replace_file_content') {
        const args = tc.args;
        if (!args) continue;
        
        let targetFile = args.TargetFile || args.targetFile;
        if (typeof targetFile === 'string') {
          if (targetFile.startsWith('"') && targetFile.endsWith('"')) {
            try {
              targetFile = JSON.parse(targetFile);
            } catch (e) {}
          }
        }
        
        if (targetFile && targetFile.toLowerCase().includes('threejswindowengine.tsx')) {
          console.log(`\n=========================================`);
          console.log(`Step ${step} (Index ${data.step_index}): Tool ${tc.name} targetFile=${targetFile}`);
          let repl = args.ReplacementContent || args.CodeContent || args.ReplacementChunks;
          if (typeof repl === 'string' && repl.startsWith('"') && repl.endsWith('"')) {
            try {
              repl = JSON.parse(repl);
            } catch (e) {}
          }
          console.log(`--- CONTENT ---`);
          console.log(typeof repl === 'object' ? JSON.stringify(repl, null, 2) : repl);
          console.log(`=========================================`);
        }
      }
    }
  }
}
