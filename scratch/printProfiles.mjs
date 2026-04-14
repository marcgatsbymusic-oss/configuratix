import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '..', 'src', 'data', 'generated_profiles.json');
const artifactDir = path.join('c:', 'Users', 'Shadow', '.gemini', 'antigravity', 'artifacts');
const artifactPath = path.join(artifactDir, 'extracted_profiles_list.md');

try {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  if (!fs.existsSync(artifactDir)){
      fs.mkdirSync(artifactDir, { recursive: true });
  }

  let md = '# Extracted Window Profiles\n\n';
  md += '> [!NOTE]\n';
  md += '> This is the complete list of all 182 product profiles successfully extracted and mapped from the Cantor SQL database.\n\n';
  
  for (const [category, profiles] of Object.entries(data)) {
    md += `## ${category} \n`;
    md += `Total count: **${profiles.length} profiles**\n\n`;
    
    profiles.forEach(p => {
      const mapping = p.cantorSystemMap ? ` *[Mapped: ${p.cantorSystemMap}]*` : '';
      const tags = p.tags && p.tags.length > 0 ? ` _(Tags: ${p.tags.map(t => t.text).join(', ')})_` : '';
      md += `- **${p.name}** (ID: \`${p.id}\`)${mapping}${tags}\n`;
    });
    md += '\n\n';
  }

  fs.writeFileSync(artifactPath, md);
  console.log(`Successfully wrote artifact to: ${artifactPath}`);
} catch (error) {
  console.error("Error processing data:", error);
}
