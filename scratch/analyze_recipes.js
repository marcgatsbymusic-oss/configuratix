import fs from 'fs';

const recipes = JSON.parse(fs.readFileSync('c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/.tmp/seed_extracted/seed/data/recipes/zlozenie_recipes.json', 'utf8'));

console.log(`Total recipes: ${Object.keys(recipes).length}`);

for (const [name, list] of Object.entries(recipes)) {
  const comps = list.map(item => `${item.component} (${item.ref})`).join(', ');
  console.log(`- ${name}: ${comps}`);
}
