import fs from 'fs';

const transcript1 = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\d3598594-8bbb-4cd9-8a81-7605d0e21db8\\.system_generated\\logs\\transcript.jsonl';
const transcript2 = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\9af80de1-8f28-4297-8cb7-4eddce15c82b\\.system_generated\\logs\\transcript.jsonl';

function searchFile(filePath, label) {
  console.log(`--- Searching ${label} ---`);
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  let stepIndex = 0;
  for (const line of lines) {
    if (!line.trim()) continue;
    stepIndex++;
    if (line.includes('handle') || line.includes('Constant Gear') || line.includes('constant gear')) {
      // Find the step index and preview
      try {
        const data = JSON.parse(line);
        console.log(`Step ${data.step_index} (${data.source}, ${data.type}): line length = ${line.length}`);
        // Let's print some snippet
        const idx = line.indexOf('handle');
        console.log(`  Snippet: ...${line.substring(idx - 50, idx + 150)}...`);
      } catch (e) {
        console.log(`Step line ${stepIndex} (JSON Parse Error): line length = ${line.length}`);
        const idx = line.indexOf('handle');
        console.log(`  Snippet: ...${line.substring(Math.max(0, idx - 50), Math.min(line.length, idx + 150))}...`);
      }
    }
  }
}

searchFile(transcript1, 'Prev Log');
searchFile(transcript2, 'Curr Log');
