import fs from 'fs';
import path from 'path';

const files = ['git_diff.patch', 'git_diff_utf8.patch', 'progress_backup_May28.patch'];

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`${file}: length = ${content.length}`);
    if (content.includes('clonedHandleLeft')) {
      console.log(`  -> Found clonedHandleLeft in ${file}!`);
    }
    if (content.includes('getHandleHeightFromBottom')) {
      console.log(`  -> Found getHandleHeightFromBottom in ${file}!`);
    }
  } else {
    console.log(`${file} does not exist.`);
  }
}
