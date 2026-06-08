import fs from 'fs';
import readline from 'readline';

const transcriptPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\d3598594-8bbb-4cd9-8a81-7605d0e21db8\\.system_generated\\logs\\transcript.jsonl';

const fileStream = fs.createReadStream(transcriptPath);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let count = 0;
for await (const line of rl) {
  count++;
  if (count !== 40) continue;
  try {
    const data = JSON.parse(line);
    if (data.source === 'MODEL' && data.tool_calls) {
      for (const tc of data.tool_calls) {
        if ((tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') && 
            tc.args.TargetFile.includes('ThreejsWindowEngine.tsx')) {
          console.log(`STEP ${count}: ${tc.args.Description || tc.args.Instruction}`);
          if (tc.name === 'replace_file_content') {
            console.log(`---------------- Target Content ----------------`);
            console.log(tc.args.TargetContent);
            console.log(`---------------- Replacement Content ----------------`);
            console.log(tc.args.ReplacementContent);
          } else {
            console.log(`--- ReplacementChunks ---`);
            console.log(JSON.stringify(tc.args.ReplacementChunks, null, 2));
          }
        }
      }
    }
  } catch (e) {
    console.error(`Line ${count}: Error parsing JSON:`, e.message);
  }
}
