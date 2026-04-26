const fs = require('fs');
const path = require('path');
const { translate } = require('bing-translate-api');

const targetLangs = ['it', 'ro', 'ru', 'uk', 'ar', 'pl', 'nl'];

const sourcePath = path.join(__dirname, 'src', 'locales', 'en.json');
const localesDir = path.join(__dirname, 'src', 'locales');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractStrings(obj, pathPrefix = '') {
  let strings = [];
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      strings.push({ path: pathPrefix ? `${pathPrefix}.${key}` : key, text: obj[key] });
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      strings = strings.concat(extractStrings(obj[key], pathPrefix ? `${pathPrefix}.${key}` : key));
    }
  }
  return strings;
}

function setStringAtPath(obj, pathStr, value) {
  const parts = pathStr.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

async function translateAll() {
  const enData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const allStrings = extractStrings(enData);
  
  for (const lang of targetLangs) {
    console.log(`Translating to ${lang}...`);
    const translatedObj = {};
    
    // We can try to translate in chunks or one by one
    // Let's do it sequentially to avoid rate limits
    for (let i = 0; i < allStrings.length; i++) {
      const item = allStrings[i];
      let translatedText = item.text;
      
      // Don't translate placeholders like {{name}}
      // Actually bing-translate might mess up {{name}}.
      // Let's temporarily replace {{...}} with something safe like ___NAME___ and restore it.
      let toTranslate = item.text;
      const placeholders = [];
      toTranslate = toTranslate.replace(/\{\{([^}]+)\}\}/g, (match, p1) => {
        placeholders.push(match);
        return `___VAR${placeholders.length - 1}___`;
      });
      
      try {
        const res = await translate(toTranslate, null, lang);
        translatedText = res.translation;
        
        // Restore placeholders
        placeholders.forEach((p, idx) => {
          const regex = new RegExp(`___VAR${idx}___`, 'gi');
          translatedText = translatedText.replace(regex, p);
        });
      } catch (err) {
        console.error(`Failed to translate "${toTranslate}" to ${lang}:`, err.message);
      }
      
      setStringAtPath(translatedObj, item.path, translatedText);
      
      if (i % 20 === 0 && i > 0) {
         console.log(`  ${i}/${allStrings.length} translated`);
         await sleep(100);
      }
    }
    
    const outPath = path.join(localesDir, `${lang}.json`);
    fs.writeFileSync(outPath, JSON.stringify(translatedObj, null, 2));
    console.log(`Saved ${outPath}`);
  }
}

translateAll().catch(console.error);
