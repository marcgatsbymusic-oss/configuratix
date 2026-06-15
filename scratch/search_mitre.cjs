const fs = require('fs');
const readline = require('readline');

async function run() {
  const filePath = 'C:/Users/Shadow/.gemini/antigravity/brain/1402b35e-6e35-4b2b-85d7-4c14038c258f/.system_generated/logs/transcript.jsonl';
  if (!fs.existsSync(filePath)) {
    console.error("Log file does not exist:", filePath);
    return;
  }
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  for await (const line of rl) {
    if (line.toLowerCase().includes('mitre') || line.toLowerCase().includes('miter')) {
      console.log(`Match at line ${count}:`);
      try {
        const parsed = JSON.parse(line);
        console.log("Type:", parsed.type);
        if (parsed.content) console.log("Content:", parsed.content.substring(0, 800));
      } catch (e) {
        console.log("Raw line substring:", line.substring(0, 500));
      }
      console.log('---');
    }
    count++;
  }
}

run().catch(console.error);
