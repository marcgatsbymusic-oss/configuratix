import fs from 'fs';

const target = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\MainConfigurator.tsx';
let data = fs.readFileSync(target, 'utf8');

// 1. Imports
const importSearch = "import { generateBlueprintPayload, downloadBlueprint } from '../../utils/exportConfig';";
const importReplace = `import { generateBlueprintPayload, downloadBlueprint } from '../../utils/exportConfig';
import { SaveToCartModal } from './SaveToCartModal';
import { ProfileCaptureModal } from './ProfileCaptureModal';
import { CartDashboard } from './CartDashboard';
import { useSessionStore } from '../../store/useSessionStore';`;
data = data.split(importSearch).join(importReplace);

// 2. State hooks
const stateSearch = "  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [activeStep]);";
const stateReplace = `  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [activeStep]);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showCartDashboard, setShowCartDashboard] = useState(false);`;
data = data.split(stateSearch).join(stateReplace);

// 3. Modals JSX
const jsxSearch = `      <FloatingHelpMenu />
      {showExitModal && <ExitIntentModal onClose={() => setShowExitModal(false)} onConfirmExit={() => window.location.href = '/'} />}`;
const jsxReplace = `      <FloatingHelpMenu />
      {showExitModal && <ExitIntentModal onClose={() => setShowExitModal(false)} onConfirmExit={() => window.location.href = '/'} />}
      
      {showSaveModal && (
        <SaveToCartModal 
          onClose={() => setShowSaveModal(false)}
          onMoreWindows={() => {
            setShowSaveModal(false);
            if (!useSessionStore.getState().email) {
              setShowLeadModal(true);
            } else {
              setShowCartDashboard(true);
            }
          }}
          onCheckout={() => {
            setShowSaveModal(false);
            if (!useSessionStore.getState().email) {
              setShowLeadModal(true);
            } else {
              setShowCartDashboard(true);
            }
          }}
        />
      )}

      {showLeadModal && (
        <ProfileCaptureModal 
          onClose={() => setShowLeadModal(false)}
          onComplete={() => {
            setShowLeadModal(false);
            setShowCartDashboard(true);
          }}
        />
      )}

      {showCartDashboard && (
        <CartDashboard 
          onClose={() => {
            setShowCartDashboard(false);
            setActiveStep(1);
            setCompletedSteps([1, 2, 3, 4, 5, 7]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onCheckout={() => {
            alert('Initiating Checkout Sequence!');
          }}
        />
      )}`;
data = data.split(jsxSearch).join(jsxReplace);

// 4. Save to Cart logic
const btnSearch = `                    onClick={() => {
                      addItem({ config: state, pricing, quantity: 1 });
                    }}`;
const btnReplace = `                    onClick={() => {
                      addItem({ 
                        config: state, 
                        pricing, 
                        quantity: 1,
                        name: \`Window System (\${state.material} \${state.profile})\`,
                        price: pricing.total,
                        image: CONFIG_SCHEMA.materials[state.material].image,
                        details: [
                           \`Dimensions: \${state.dimensions.width}x\${state.dimensions.height}mm\`,
                           \`Color: \${state.interiorColor} (In) / \${state.exteriorColor} (Out)\`,
                           \`Opening: \${state.sashOpenings.length} Sashes\`,
                           \`Integrations: \${state.addons.length}\`
                        ]
                      });
                      setShowSaveModal(true);
                    }}`;
data = data.split(btnSearch).join(btnReplace);

fs.writeFileSync(target, data);
console.log('Commerce intercepts mounted directly into MainConfigurator workflow');
