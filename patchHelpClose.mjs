import fs from 'fs';
const filepath = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\MainConfigurator.tsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/<MaterialHelp \/>/g, '<MaterialHelp onClose={() => setExpandedHelpSection(null)} />');
content = content.replace(/<WindowTypeHelp \/>/g, '<WindowTypeHelp onClose={() => setExpandedHelpSection(null)} />');

fs.writeFileSync(filepath, content);
console.log('Close buttons wired');
