import fs from 'fs';
const filepath = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\MainConfigurator.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Add imports
if (!content.includes('FloatingHelpMenu')) {
  content = content.replace(
    /import \{ ([^}]+) \} from 'lucide-react';/,
    "import { $1, HelpCircle } from 'lucide-react';\nimport { FloatingHelpMenu } from './FloatingHelpMenu';\nimport { ExitIntentModal } from './ExitIntentModal';\nimport { MaterialHelp, WindowTypeHelp } from './HelpContents';"
  );
}

// Add state
if (!content.includes('expandedHelpSection')) {
  content = content.replace(
    /const \[activeStep, setActiveStep\] = useState\(1\);/,
    "const [activeStep, setActiveStep] = useState(1);\n  const [expandedHelpSection, setExpandedHelpSection] = useState<number | null>(null);\n  const [showExitModal, setShowExitModal] = useState(false);\n\n  const toggleHelp = (step: number) => {\n    setExpandedHelpSection(prev => prev === step ? null : step);\n  };"
  );
}

// Add overlays at top level return
if (!content.includes('<FloatingHelpMenu />')) {
  // Find the master return div
  content = content.replace(
    /return \(\n    <div className="min-h-screen/,
    "return (\n    <>\n      <FloatingHelpMenu />\n      {showExitModal && <ExitIntentModal onClose={() => setShowExitModal(false)} onConfirmExit={() => window.location.href = '/'} />}\n      <div className=\"min-h-screen"
  );
  // Add React fragment wrap at very end
  content = content.replace(/(    <\/div>\n  \);\n};?\n?)$/s, "    </div>\n    </>\n  );\n};\n");
}

fs.writeFileSync(filepath, content);
console.log('MainConfigurator framework patched');
