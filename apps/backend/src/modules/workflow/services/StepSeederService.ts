import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STEPS = [
  {
    id: 'ENTRY_AUTH',
    name: 'Entry and Authentication',
    sequence: 10,
    conditionalityRules: {}, // Always applies
    checklistItems: ['Credentials Verified', 'Opening Match Confirmed'],
    evidenceRequirements: [],
    expectedTools: [],
    preconditions: {}, // No preconditions
    blockingTimerMinutes: null,
  },
  {
    id: 'SITE_ASSESSMENT',
    name: 'Site Assessment',
    sequence: 20,
    conditionalityRules: {}, 
    checklistItems: ['Site conditions reviewed'],
    evidenceRequirements: ['OPENING_PHOTO'],
    expectedTools: [],
    preconditions: { dependsOn: ['ENTRY_AUTH'] },
    blockingTimerMinutes: null,
  },
  {
    id: 'REMOVAL_EXISTING',
    name: 'Removal of Existing Window',
    sequence: 30,
    conditionalityRules: { installationType: 'REPLACEMENT' }, 
    checklistItems: ['Existing window removed safely', 'Opening cleared of debris'],
    evidenceRequirements: ['CLEARED_OPENING_PHOTO'],
    expectedTools: ['Crowbar', 'Reciprocating Saw', 'Vacuum'],
    preconditions: { dependsOn: ['SITE_ASSESSMENT'] },
    blockingTimerMinutes: null,
  },
  {
    id: 'FRAME_PLACEMENT',
    name: 'Frame Placement and Provisional Securing',
    sequence: 40,
    conditionalityRules: {}, 
    checklistItems: ['Sashes/glazing removed (if applicable)', 'Frame positioned', 'Safety: Secured against falling'],
    evidenceRequirements: ['SECURED_FRAME_PHOTO'],
    expectedTools: ['Wedges', 'Inflatable Cushions', 'Suction Pads'],
    preconditions: { dependsOn: ['SITE_ASSESSMENT'] }, // Implicitly depends on removal if replacement
    blockingTimerMinutes: null,
  },
  {
    id: 'LEVELLING',
    name: 'Levelling',
    sequence: 50,
    conditionalityRules: {}, 
    checklistItems: ['Level and plumb checked', 'Fastening materials adequate'],
    evidenceRequirements: ['LEVEL_X_PHOTO', 'LEVEL_Y_PHOTO', 'LEVEL_Z_PHOTO', 'INCLINOMETER_PHOTO'],
    expectedTools: ['Spirit Level', 'Digital Inclinometer'],
    preconditions: { dependsOn: ['FRAME_PLACEMENT'] },
    blockingTimerMinutes: null,
  },
  {
    id: 'MECHANICAL_FIXING',
    name: 'Mechanical Fixing',
    sequence: 60,
    conditionalityRules: { fixingMethod: 'SCREW' }, 
    checklistItems: ['Frame drilled', 'Substrate drilled', 'Fixings applied per sequence', 'Post-fixing level re-check'],
    evidenceRequirements: ['FIXING_DETAIL_PHOTO'],
    expectedTools: ['Cordless Drill', 'Hammer Drill', '6mm Steel Bit', '6mm Concrete Bit', 'Torque Driver'],
    preconditions: { dependsOn: ['LEVELLING'] },
    blockingTimerMinutes: null,
  },
  {
    id: 'SEALING',
    name: 'Sealing and Foaming',
    sequence: 70,
    conditionalityRules: { requiresFoam: true }, 
    checklistItems: ['Three-layer sealing sequence applied'],
    evidenceRequirements: ['SEALED_JOINT_PHOTO'],
    expectedTools: ['Expanding Foam', 'Sealant Gun'],
    preconditions: { dependsOn: ['MECHANICAL_FIXING'] },
    blockingTimerMinutes: 40, // 40-minute cure timer (FR-5.25)
  },
  {
    id: 'SASH_REFIT',
    name: 'Sash Re-fit and Adjustment',
    sequence: 80,
    conditionalityRules: {}, 
    checklistItems: ['Sashes re-hung', 'Operation check (opens/closes smoothly)', 'Adjustments made if necessary'],
    evidenceRequirements: ['COMPLETED_WINDOW_PHOTO'],
    expectedTools: ['4mm Allen Key'],
    preconditions: { dependsOn: ['SEALING'] }, // Needs foam to cure if foam was used
    blockingTimerMinutes: null,
  },
  {
    id: 'FINISHING',
    name: 'Finishing Operations',
    sequence: 90,
    conditionalityRules: { requiresFinishing: true }, 
    checklistItems: ['Trims installed', 'Blinds wired and calibrated (if applicable)'],
    evidenceRequirements: [],
    expectedTools: ['Cable Cutters', 'Electrical Tester'],
    preconditions: { dependsOn: ['SASH_REFIT'] },
    blockingTimerMinutes: null,
  },
  {
    id: 'COMPLETION',
    name: 'Completion',
    sequence: 100,
    conditionalityRules: {}, 
    checklistItems: ['Site left clean', 'Window wiped down'],
    evidenceRequirements: [],
    expectedTools: [],
    preconditions: { dependsOn: ['SASH_REFIT'] }, // Implicitly depends on finishing if required
    blockingTimerMinutes: null,
  }
];

export class StepSeederService {
  async seedSteps() {
    console.log("Seeding WorkflowStepDefinitions...");

    for (const step of STEPS) {
      await prisma.workflowStepDefinition.upsert({
        where: { id: step.id },
        update: {
          name: step.name,
          sequence: step.sequence,
          conditionalityRules: step.conditionalityRules,
          checklistItems: step.checklistItems,
          evidenceRequirements: step.evidenceRequirements,
          expectedTools: step.expectedTools,
          preconditions: step.preconditions,
          blockingTimerMinutes: step.blockingTimerMinutes
        },
        create: {
          id: step.id,
          name: step.name,
          sequence: step.sequence,
          conditionalityRules: step.conditionalityRules,
          checklistItems: step.checklistItems,
          evidenceRequirements: step.evidenceRequirements,
          expectedTools: step.expectedTools,
          preconditions: step.preconditions,
          blockingTimerMinutes: step.blockingTimerMinutes
        }
      });
      console.log(`Seeded: ${step.name}`);
    }

    console.log("Seeding complete.");
  }
}

// Allow execution as a script
if (require.main === module) {
  const seeder = new StepSeederService();
  seeder.seedSteps()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
