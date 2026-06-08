import fs from 'fs';

const logPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\9af80de1-8f28-4297-8cb7-4eddce15c82b\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    if (data.step_index === 535) {
      console.log(`=== STEP 535 Object (type: ${data.type}, source: ${data.source}) ===`);
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (e) {
    // ignore
  }
}
