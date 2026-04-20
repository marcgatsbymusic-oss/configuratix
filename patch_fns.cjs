const fs = require('fs');
let code = fs.readFileSync('src/utils/cantorPricing/fns.ts', 'utf8');
code = code.replace('return (name: string, args: Value[]): Value | undefined => {', 'const dispatch = (name: string, args: Value[]): Value | undefined => {');
fs.writeFileSync('src/utils/cantorPricing/fns.ts', code);
