import fs from 'fs';

const logPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\9af80de1-8f28-4297-8cb7-4eddce15c82b\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    if (data.step_index === 391 && data.source === 'MODEL' && data.tool_calls) {
      for (const tc of data.tool_calls) {
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
      }
    }
  } catch (e) {
    // ignore
  }
}
