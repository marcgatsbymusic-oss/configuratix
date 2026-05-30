import fs from 'fs';
import path from 'path';

const dir = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\public\\assets\\windowtypes';
const filesToCheck = ['F100.jpg', 'F101.jpg', 'F103.jpg', 'F104.jpg', 'F105.jpg'];

filesToCheck.forEach(filename => {
  const p = path.join(dir, filename);
  if (!fs.existsSync(p)) {
    console.log(`${filename} does not exist.`);
    return;
  }
  const fd = fs.openSync(p, 'r');
  const buffer = Buffer.alloc(100);
  fs.readSync(fd, buffer, 0, 100, 0);
  fs.closeSync(fd);
  
  console.log(`=== ${filename} ===`);
  console.log('Size:', fs.statSync(p).size);
  console.log('First 50 chars as text:', buffer.toString('utf8', 0, 50));
  console.log('Hex bytes:', buffer.slice(0, 10).toString('hex'));
});
