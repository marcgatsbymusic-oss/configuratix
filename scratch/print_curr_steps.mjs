import fs from 'fs';

const logPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\9af80de1-8f28-4297-8cb7-4eddce15c82b\\.system_generated\\logs\\transcript.jsonl';
const targetSteps = [50, 57, 79, 85, 94, 108, 126, 155, 184, 190, 196, 202, 208, 217, 220, 226];

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    if (targetSteps.includes(data.step_index) && data.source === 'MODEL' && data.tool_calls) {
      for (const tc of data.tool_calls) {
        if (tc.args && tc.args.TargetFile && tc.args.TargetFile.includes('ThreejsWindowEngine.tsx')) {
          console.log(`\n=========================================`);
          console.log(`Step ${data.step_index}: ${tc.args.Description || tc.args.Instruction}`);
          console.log(`Tool: ${tc.name}`);
          if (tc.name === 'replace_file_content') {
            console.log(`--- TARGET CONTENT ---`);
            console.log(tc.args.TargetContent);
            console.log(`--- REPLACEMENT CONTENT ---`);
            console.log(tc.args.ReplacementContent);
          } else {
            console.log(`--- REPLACEMENT CHUNKS ---`);
            console.log(JSON.stringify(tc.args.ReplacementChunks, null, 2));
          }
          console.log(`=========================================`);
        }
      }
    }
  } catch (e) {
    // ignore parse error
  }
}
