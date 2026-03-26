import fs from 'fs';
const filepath = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\MainConfigurator.tsx';
let content = fs.readFileSync(filepath, 'utf8');

[
  { step: 1, key: 'material', helpComp: '<MaterialHelp />' },
  { step: 2, key: 'system', helpComp: null },
  { step: 3, key: 'windowType', helpComp: '<WindowTypeHelp />' },
  { step: 4, key: 'opening', helpComp: null },
  { step: 5, key: 'color', helpComp: null },
  { step: 6, key: 'dimensions', helpComp: null },
  { step: 7, key: 'glazing', helpComp: null },
  { step: 8, key: 'accessories', helpComp: null }
].forEach(({ step, key, helpComp }) => {
  const searchPattern = new RegExp(
    `(<h2 className={\`text-xl font-bold transition-colors \\\$\\{activeStep === ${step} \\? 'text-white\\/90' : 'text-white\\/40'\\}\`}>\\{t\\('configurator\\.steps\\.${key}'(?:, '.*?')?\\)\\}<\\/h2>\\s*)<\\/div>`
  );
  
  let replacement = `$1  <button onClick={(e) => { e.stopPropagation(); toggleHelp(${step}); }} className="text-white/40 hover:text-[#dca95c] transition-colors ml-1" title="Toggle Help"><HelpCircle size={18} /></button>\n                </div>`;
  
  if (helpComp) {
    replacement += `\n                {expandedHelpSection === ${step} && ${helpComp}}`;
  }
  
  content = content.replace(searchPattern, replacement);
});

fs.writeFileSync(filepath, content);
console.log('Step headers patched!');
