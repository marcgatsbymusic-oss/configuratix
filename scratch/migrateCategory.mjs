import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const p = path.join(__dirname, '..', 'src', 'components', 'SlateConfigurator', 'MainConfigurator.tsx');

let content = fs.readFileSync(p, 'utf8');
content = content.replace(/state\.material/g, 'state.category')
                 .replace(/CONFIG_SCHEMA\.materials/g, 'CONFIG_SCHEMA.categories')
                 .replace(/'SET_MATERIAL'/g, "'SET_CATEGORY'")
                 .replace(/configurator\.steps\.material/g, 'configurator.steps.category')
                 .replace(/configurator\.materials\./g, 'configurator.categories.')
                 .replace(/materialScrollRef/g, 'categoryScrollRef')
                 .replace(/const mat of /g, 'const cat of')
                 .replace(/mat\}/g, 'cat}')
                 .replace(/mat \}/g, 'cat }')
                 .replace(/mat\)/g, 'cat)')
                 .replace(/mat\]/g, 'cat]')
                 .replace(/key=\{mat\}/g, 'key={cat}');

fs.writeFileSync(p, content);
console.log('Migration complete');
