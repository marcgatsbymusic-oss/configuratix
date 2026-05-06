import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import translate from 'google-translate-api-x';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCALES_DIR = path.resolve(__dirname, '../src/locales');

const stringsToTranslate = {
  title: "Did you know?",
  description: "You can switch between Night and Day mode at any time using the theme toggle icon located in the top right corner of the navigation bar.",
  dismiss: "Got it, thanks!"
};

async function run() {
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const langCode = file.replace('.json', '');
    const filePath = path.join(LOCALES_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // English is the base, just insert directly
    if (langCode === 'en') {
      content.themeHint = stringsToTranslate;
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      console.log(`Updated ${file} with base English text`);
      continue;
    }

    console.log(`Translating for ${langCode}...`);
    try {
      // Map locales if needed (e.g. sometimes 'no' is 'no', google translate usually handles it)
      const resTitle = await translate(stringsToTranslate.title, { to: langCode });
      const resDesc = await translate(stringsToTranslate.description, { to: langCode });
      const resDismiss = await translate(stringsToTranslate.dismiss, { to: langCode });

      content.themeHint = {
        title: resTitle.text,
        description: resDesc.text,
        dismiss: resDismiss.text
      };

      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      console.log(`Successfully updated ${file}`);
    } catch (e) {
      console.error(`Failed to translate for ${langCode}:`, e.message);
    }
  }
}

run();
