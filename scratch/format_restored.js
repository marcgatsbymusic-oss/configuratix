import fs from 'fs';

let raw = fs.readFileSync('scratch/generate_full_colored_svg_restored.mjs', 'utf-8').trim();

// If it starts with quotes, parse it as a JSON string.
// Let's use a dynamic function or JSON.parse. Since it is a double-quoted string with escaped characters,
// parsing it as a JSON value should work, but if it has unescaped double quotes inside (due to a bug in how it was written),
// let's try to parse it.
try {
  // Try direct parsing
  const parsed = JSON.parse(raw);
  fs.writeFileSync('scratch/generate_full_colored_svg_clean.js', parsed, 'utf-8');
  console.log("Successfully parsed with JSON.parse.");
} catch (e) {
  console.log("JSON.parse failed:", e.message);
  try {
    // If it fails, maybe it has raw newlines inside or is double-escaped. Let's do a simple eval-like parsing in a secure way.
    // Or we can replace \n and other escapes manually.
    // Since we know it's a JavaScript string literal, we can wrap it in a module and import it, or use a Function constructor.
    const fn = new Function('return ' + raw);
    const parsed = fn();
    fs.writeFileSync('scratch/generate_full_colored_svg_clean.js', parsed, 'utf-8');
    console.log("Successfully parsed with Function constructor.");
  } catch (e2) {
    console.log("Function constructor failed:", e2.message);
    // Fallback: manually replace \n, \", \\ etc.
    // Let's see if we can just strip the leading and trailing quotes and replace escaped characters.
    if (raw.startsWith('"') && raw.endsWith('"')) {
      raw = raw.slice(1, -1);
    }
    const unescaped = raw
      .replace(/\\r/g, '\r')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
    fs.writeFileSync('scratch/generate_full_colored_svg_clean.js', unescaped, 'utf-8');
    console.log("Manually unescaped quotes/escapes.");
  }
}
