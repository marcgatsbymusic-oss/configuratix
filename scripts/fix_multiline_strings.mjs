import fs from 'fs';

let content = fs.readFileSync('src/data/productDetails.ts', 'utf8');

// Replace single-quoted descriptions with backticks to support multi-line strings
content = content.replace(/description:\s*'([^]*?)',/g, (match, p1) => {
    // If there's an actual backtick inside the description, we'd need to escape it, but it's unlikely.
    // Just in case:
    const escaped = p1.replace(/`/g, '\\`');
    return `description: \`${escaped}\`,`;
});

fs.writeFileSync('src/data/productDetails.ts', content);
console.log('Fixed multiline descriptions.');
