import fs from 'fs';

const file = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\MainConfigurator.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('stepOrder')) {
  // 1. Hook up stepOrder
  content = content.replace(
    "const [activeStep, setActiveStep] = useState(1);",
    "const [activeStep, setActiveStep] = useState(1);\n  const [stepOrder, setStepOrder] = useState<number[]>([1,2,3,4,5,6,7,8]);\n  const advanceStep = (current: number, next: number) => { setTimeout(() => { setActiveStep(next); setStepOrder(prev => { const n = prev.filter(s => s !== current); n.push(current); return n; }); }, 350); };"
  );

  // 2. Convert parent column to Flex Column for order to work
  content = content.replace(
    'className="lg:col-span-8 space-y-8"',
    'className="lg:col-span-8 flex flex-col gap-8"'
  );

  // 3. Anchor contextual headers at the very top 
  content = content.replace(
    '{/* Contextual Headers aligned with Accordions */}\n            <div className="px-2 pt-2 pb-2">',
    '{/* Contextual Headers aligned with Accordions */}\n            <div className="px-2 pt-2 pb-2" style={{ order: -1 }}>'
  );

  // 4. Inject structural order arrays to the <sections>
  for (let i = 1; i <= 8; i++) {
    const regex = new RegExp(`(\\{/\\* Step ${i}:.*?\\*/\\}\\s*<section className="[^"]+")(.*?)(>)`, 'g');
    content = content.replace(regex, `$1 style={{ order: stepOrder.indexOf(${i}) }}$2$3`);
  }

  // 5. Mutate the automatic timeout progressions
  content = content.replace(/setTimeout\(\(\) => setActiveStep\(2\), 350\)/g, "advanceStep(1, 2)");
  content = content.replace(/setTimeout\(\(\) => setActiveStep\(3\), 350\)/g, "advanceStep(2, 3)");
  content = content.replace(/setTimeout\(\(\) => setActiveStep\(4\), 350\)/g, "advanceStep(3, 4)");
  content = content.replace(/setTimeout\(\(\) => setActiveStep\(6\), 350\)/g, "advanceStep(5, 6)");
  content = content.replace(/setTimeout\(\(\) => setActiveStep\(8\), 300\)/g, "advanceStep(7, 8)");

  // 6. Mutate manual button progressions
  content = content.replace(/onClick=\{\(\) => setActiveStep\(5\)\}/g, "onClick={() => advanceStep(4, 5)}");
  content = content.replace(/onClick=\{\(\) => setActiveStep\(7\)\}/g, "onClick={() => advanceStep(6, 7)}");

  fs.writeFileSync(file, content);
  console.log('Flex DOM reordering logic applied successfully.');
} else {
  console.log('Flex DOM already applied.');
}
