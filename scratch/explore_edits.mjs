import fs from 'fs';

const transcript1 = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\d3598594-8bbb-4cd9-8a81-7605d0e21db8\\.system_generated\\logs\\transcript.jsonl';
const transcript2 = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\9af80de1-8f28-4297-8cb7-4eddce15c82b\\.system_generated\\logs\\transcript.jsonl';

function explore(filePath, label) {
  console.log(`\n=== EXPLORING ${label} ===`);
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  let stepIndex = 0;
  for (const line of lines) {
    if (!line.trim()) continue;
    stepIndex++;
    if (line.includes('ThreejsWindowEngine.tsx')) {
      try {
        const data = JSON.parse(line);
        if (data.source === 'MODEL' && data.tool_calls) {
          for (const tc of data.tool_calls) {
            if (tc.args && tc.args.TargetFile && tc.args.TargetFile.includes('ThreejsWindowEngine.tsx')) {
              const isTruncated = line.includes('truncated');
              console.log(`Step ${data.step_index}: name=${tc.name} desc="${tc.args.Description || tc.args.Instruction}" truncated=${isTruncated} len=${line.length}`);
            }
          }
        }
      } catch (e) {
        const isTruncated = line.includes('truncated');
        console.log(`Step line ${stepIndex} (Parse Error): truncated=${isTruncated} len=${line.length}`);
      }
    }
  }
}

explore(transcript1, 'Prev Log');
explore(transcript2, 'Curr Log');
