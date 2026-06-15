import fs from 'fs';

const logFile = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\6b9806df-1085-4711-9884-04ae8c4485f5\\.system_generated\\logs\\transcript.jsonl';
if (fs.existsSync(logFile)) {
  const lines = fs.readFileSync(logFile, 'utf8').trim().split('\n');
  lines.forEach((l, idx) => {
    const obj = JSON.parse(l);
    if (obj.source === 'USER_EXPLICIT' || obj.type === 'USER_INPUT') {
      console.log(`\n=== Step ${idx} ===`);
      console.log(obj.content);
    }
  });
} else {
  console.log("Log file not found");
}
