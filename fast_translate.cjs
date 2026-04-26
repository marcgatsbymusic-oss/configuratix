const fs = require('fs');
const path = require('path');
const translate = require('google-translate-api-x');

const targetLangs = ['es', 'de', 'fr', 'ca', 'pt', 'eu', 'it', 'ro', 'ru', 'uk', 'ar', 'pl', 'nl', 'sv', 'no', 'fi'];

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
  const allStringsItems = extractStrings(enData);
  
  // Protect interpolation variables {{var}}
  const textsToTranslate = allStringsItems.map(item => {
    let text = item.text;
    text = text.replace(/\{\{([^}]+)\}\}/g, '<span translate="no">$1</span>');
    return text;
  });

  for (const lang of targetLangs) {
    console.log(`Translating to ${lang}...`);
    const translatedObj = {};
    const translatedTexts = [];
    const CHUNK_SIZE = 50;
    
    for (let i = 0; i < textsToTranslate.length; i += CHUNK_SIZE) {
      const chunk = textsToTranslate.slice(i, i + CHUNK_SIZE);
      try {
        const res = await translate(chunk, { to: lang });
        const resultsArray = Array.isArray(res) ? res : [res];
        for (const result of resultsArray) {
          translatedTexts.push(result.text);
        }
        await sleep(300);
      } catch (err) {
        console.error(`Error chunk ${i}:`, err.message);
        for(let j=0; j<chunk.length; j++) translatedTexts.push(chunk[j]);
      }
    }
    
    // Restore variables and build object
    for (let i = 0; i < allStringsItems.length; i++) {
      let tText = translatedTexts[i];
      if (tText) {
          tText = tText.replace(/<span translate="no">\s*([^<]+?)\s*<\/span>/gi, '{{$1}}');
          setStringAtPath(translatedObj, allStringsItems[i].path, tText);
      } else {
          setStringAtPath(translatedObj, allStringsItems[i].path, allStringsItems[i].text);
      }
    }
    
    const outPath = path.join(localesDir, `${lang}.json`);
    fs.writeFileSync(outPath, JSON.stringify(translatedObj, null, 2));
    console.log(`Saved ${outPath}`);
  }
}

translateAll().catch(console.error);
