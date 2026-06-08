import fs from 'fs';
import path from 'path';

// Load base file content from git (which is the last committed working state)
import { execSync } from 'child_process';
const Cwd = process.cwd();

console.log("Reading base file from git commit...");
const baseContent = execSync("git show HEAD:src/components/configurator/ThreejsWindowEngine.tsx", { encoding: 'utf8' });

// We need to parse edits from the first transcript (d3598594-8bbb-4cd9-8a81-7605d0e21db8)
// and then the second transcript (9af80de1-8f28-4297-8cb7-4eddce15c82b) up to step 433.
const transcript1 = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\d3598594-8bbb-4cd9-8a81-7605d0e21db8\\.system_generated\\logs\\transcript.jsonl';
const transcript2 = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\9af80de1-8f28-4297-8cb7-4eddce15c82b\\.system_generated\\logs\\transcript.jsonl';

function parseLine(line, stepIndex) {
  try {
    return JSON.parse(line);
  } catch (e) {
    let cleaned = line.replace(/\t/g, '\\t');
    cleaned = cleaned.replace(/[\x00-\x08\x0B-\x1F]/g, (char) => {
      const hex = char.charCodeAt(0).toString(16).padStart(4, '0');
      return '\\u' + hex;
    });
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      console.error(`Line ${stepIndex}: Failed to parse line even after cleaning:`, err.message);
      const match = err.message.match(/position (\d+)/);
      if (match) {
        const pos = Number(match[1]);
        console.error(`Char at error pos: code=${cleaned.charCodeAt(pos)} value=${JSON.stringify(cleaned[pos])}`);
        console.error(`Around error: ${cleaned.substring(Math.max(0, pos - 50), Math.min(cleaned.length, pos + 50))}`);
      }
      throw err;
    }
  }
}

function extractEdits(filePath, maxStep = Infinity) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const edits = [];
  let stepIndex = 0;
  for (const line of lines) {
    if (!line.trim()) continue;
    stepIndex++;
    try {
      const data = parseLine(line, stepIndex);
      const currentStep = data.step_index;
      if (currentStep >= maxStep) continue;
      if (data.source === 'MODEL' && data.tool_calls) {
        for (const tc of data.tool_calls) {
          if ((tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') && 
              tc.args.TargetFile.includes('ThreejsWindowEngine.tsx')) {
            edits.push({
              step: currentStep,
              name: tc.name,
              args: tc.args
            });
          }
        }
      }
    } catch (e) {
      // Ignore parse errors on truncated lines at end of log
    }
  }
  return edits;
}

console.log("Extracting edits from previous conversation...");
const edits1 = extractEdits(transcript1);
console.log(`Found ${edits1.length} edits in previous conversation.`);

console.log("Extracting edits from current conversation...");
const edits2 = extractEdits(transcript2, 434);
console.log(`Found ${edits2.length} edits in current conversation before step 434.`);

const allEdits = [...edits1, ...edits2];

let content = baseContent;

// Utility to apply a single replacement chunk
function applyChunk(currentContent, target, replacement, stepInfo) {
  // Normalize newlines to avoid mismatch
  const normContent = currentContent.replace(/\r\n/g, '\n');
  const normTarget = target.replace(/\r\n/g, '\n');
  const normReplacement = replacement.replace(/\r\n/g, '\n');
  
  const idx = normContent.indexOf(normTarget);
  if (idx === -1) {
    throw new Error(`Could not find target content for Step ${stepInfo}:\n--- Target ---\n${target}\n--------------`);
  }
  
  // Verify uniqueness
  if (normContent.indexOf(normTarget, idx + 1) !== -1) {
    throw new Error(`Target content is not unique in Step ${stepInfo}:\n--- Target ---\n${target}\n--------------`);
  }
  
  const before = normContent.substring(0, idx);
  const after = normContent.substring(idx + normTarget.length);
  return before + normReplacement + after;
}

// Apply edits sequentially
for (const edit of allEdits) {
  console.log(`Applying edit: Step ${edit.step} [${edit.name}] - ${edit.args.Description || edit.args.Instruction}`);
  try {
    if (edit.name === 'replace_file_content') {
      content = applyChunk(content, edit.args.TargetContent, edit.args.ReplacementContent, edit.step);
    } else {
      let chunks = edit.args.ReplacementChunks;
      if (typeof chunks === 'string') {
        let cleaned = chunks.replace(/\t/g, '\\t');
        cleaned = cleaned.replace(/[\x00-\x08\x0B-\x1F]/g, (char) => {
          const hex = char.charCodeAt(0).toString(16).padStart(4, '0');
          return '\\u' + hex;
        });
        try {
          chunks = JSON.parse(cleaned);
        } catch (e) {
          try {
            chunks = new Function("return (" + cleaned + ")")();
          } catch (err) {
            console.error(`ERROR parsing ReplacementChunks string for step ${edit.step}:`, err.message);
            fs.writeFileSync('scratch/failed_chunks.txt', cleaned, 'utf8');
            throw err;
          }
        }
      }
      // Apply chunks in reverse order of target positions to avoid shifting indices if we were using indices,
      // but since we are doing simple indexOf replacement, we can just apply them. We need to be careful if one target matches another.
      for (const chunk of chunks) {
        content = applyChunk(content, chunk.TargetContent, chunk.ReplacementContent, `${edit.step} (chunk)`);
      }
    }
  } catch (err) {
    console.error(`ERROR applying step ${edit.step}:`, err.message);
    process.exit(1);
  }
}

// Write the reconstructed file
const targetPath = path.join(Cwd, 'src/components/configurator/ThreejsWindowEngine.tsx');
fs.writeFileSync(targetPath, content, 'utf8');
console.log(`SUCCESS: Reconstructed file written to ${targetPath}`);
