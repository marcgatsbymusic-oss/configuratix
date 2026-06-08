import fs from 'fs';
import path from 'path';

const logPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\d3598594-8bbb-4cd9-8a81-7605d0e21db8\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    if (data.step_index === 41) {
      console.log("Found step 41. Type:", data.type, "Source:", data.source);
      if (data.tool_calls) {
        for (const tc of data.tool_calls) {
          console.log("Tool call name:", tc.name);
          const chunks = tc.args.ReplacementChunks;
          console.log("typeof ReplacementChunks:", typeof chunks);
          if (typeof chunks === 'string') {
            console.log("ReplacementChunks length:", chunks.length);
            // Write to a separate file to see the raw text
            fs.writeFileSync('scratch/step41_raw_chunks.txt', chunks, 'utf8');
            console.log("Wrote raw chunks string to scratch/step41_raw_chunks.txt");
          } else {
            console.log("Chunks is an object. Keys/Length:", Array.isArray(chunks) ? chunks.length : Object.keys(chunks));
          }
        }
      }
    }
  } catch (e) {
    // ignore parse error on line
  }
}
