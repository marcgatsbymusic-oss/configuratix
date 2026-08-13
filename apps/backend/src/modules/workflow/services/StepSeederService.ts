import { PrismaClient } from '@prisma/client';
import { FoamSealingConfig, isFoamConfigVerified } from '../config/FoamSealingConfig';

const prisma = new PrismaClient();

// Log warning if Foam Config contains unverified placeholders (Do Not Invent compliance rule)
if (!isFoamConfigVerified()) {
  console.warn(
    `[WARNING] Sealing/Curing timer configuration contains PLACEHOLDER_UNVERIFIED values. ` +
    `Defaulting to database null values for cure timers until verified config is loaded.`
  );
}

const resolvedCureTime = isFoamConfigVerified()
  ? Number(FoamSealingConfig.sashRefitCureTimerMinutes)
  : null;

const STEPS = [
  // --- Standard Casement Window Steps ---
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
    conditionalityRules: { productType: 'WINDOW' }, 
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
    conditionalityRules: { productType: 'WINDOW' }, 
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
    conditionalityRules: { fixingMethod: 'SCREW', productType: 'WINDOW' }, 
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
    blockingTimerMinutes: resolvedCureTime, // Dynamic resolution from config
  },
  {
    id: 'SASH_REFIT',
    name: 'Sash Re-fit and Adjustment',
    sequence: 80,
    conditionalityRules: { productType: 'WINDOW' }, 
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
  },

  // --- Sliding Door Variant Steps ---
  {
    id: 'SLIDING_TRACK_PLACEMENT',
    name: 'Sliding Track Placement & Levelling',
    sequence: 41,
    conditionalityRules: { productType: 'SLIDING_DOOR' },
    checklistItems: ['Bottom track clean', 'Tracks levels verified in X/Y axes', 'Provisionally secured'],
    evidenceRequirements: ['SLIDING_TRACK_LEVEL_PHOTO'],
    expectedTools: ['Heavy Wedges', 'Spirit Level'],
    preconditions: { dependsOn: ['SITE_ASSESSMENT'] },
    blockingTimerMinutes: null,
  },
  {
    id: 'SLIDING_LEAF_REFIT',
    name: 'Sliding Leaf Re-fit & Roller Adjustment',
    sequence: 81,
    conditionalityRules: { productType: 'SLIDING_DOOR' },
    checklistItems: ['Active leaf hung', 'Rollers height adjusted', 'Gaskets contact checked'],
    evidenceRequirements: ['ROLLER_ADJUSTMENT_PHOTO'],
    expectedTools: ['Screwdriver', 'Suction Pads'],
    preconditions: { dependsOn: ['SEALING'] },
    blockingTimerMinutes: null,
  },

  // --- Entrance Door Variant Steps ---
  {
    id: 'DOOR_THRESHOLD_PLACEMENT',
    name: 'Door Threshold & Frame Placement',
    sequence: 42,
    conditionalityRules: { productType: 'DOOR' },
    checklistItems: ['Threshold seated flat on moisture barrier', 'Frame plumbed and secured against wind'],
    evidenceRequirements: ['THRESHOLD_PLACEMENT_PHOTO'],
    expectedTools: ['Heavy Anchors', 'Moisture Sealing Tape'],
    preconditions: { dependsOn: ['SITE_ASSESSMENT'] },
    blockingTimerMinutes: null,
  },
  {
    id: 'DOOR_LOCK_ADJUSTMENT',
    name: 'Door Multi-Point Lock & Keeper Adjustment',
    sequence: 82,
    conditionalityRules: { productType: 'DOOR' },
    checklistItems: ['Multi-point lock hooks clear keepers', 'Latches grab cleanly', 'Cylinder turns without friction'],
    evidenceRequirements: ['DOOR_KEEPER_PHOTO'],
    expectedTools: ['Torx T15 Key'],
    preconditions: { dependsOn: ['SEALING'] },
    blockingTimerMinutes: null,
  },

  // --- Roller Blind (Built-in) Variant Steps ---
  {
    id: 'ROLLER_BLIND_BUILTIN_MOUNT',
    name: 'Built-in Roller Blind Box Mounting',
    sequence: 35,
    conditionalityRules: { productType: 'ROLLER_BLIND_BUILTIN' },
    checklistItems: ['Insulation insert seated', 'Blind adapter profile locked into frame head', 'Guide rails aligned'],
    evidenceRequirements: ['BUILTIN_BLIND_BOX_PHOTO'],
    expectedTools: ['Rubber Mallet'],
    preconditions: { dependsOn: ['SITE_ASSESSMENT'] },
    blockingTimerMinutes: null,
  },

  // --- Roller Blind (Surface-mounted) Variant Steps ---
  {
    id: 'ROLLER_BLIND_SURFACE_MOUNT',
    name: 'Surface Roller Blind Box Installation',
    sequence: 91,
    conditionalityRules: { productType: 'ROLLER_BLIND_SURFACE' },
    checklistItems: ['Blind housing mounted on outer masonry facade', 'Cable routed via sleeve', 'Limit stops calibrated'],
    evidenceRequirements: ['SURFACE_BLIND_MOUNT_PHOTO'],
    expectedTools: ['Concrete Masonry drill', 'Silicone sealant'],
    preconditions: { dependsOn: ['SASH_REFIT'] },
    blockingTimerMinutes: null,
  },

  // --- External Venetian Blind Variant Steps ---
  {
    id: 'VENETIAN_BLIND_EXTERNAL_MOUNT',
    name: 'External Venetian Blind Installation',
    sequence: 92,
    conditionalityRules: { productType: 'VENETIAN_BLIND_EXTERNAL' },
    checklistItems: ['Blind console bracket secure', 'Guide rails mounted plumb', 'Slats pack moves freely'],
    evidenceRequirements: ['EXTERNAL_VENETIAN_PHOTO'],
    expectedTools: ['Laser Level', 'Cordless Driver'],
    preconditions: { dependsOn: ['SASH_REFIT'] },
    blockingTimerMinutes: null,
  },

  // --- Internal Venetian Blind Variant Steps ---
  {
    id: 'VENETIAN_BLIND_INTERNAL_MOUNT',
    name: 'Internal Venetian Blind Mounting',
    sequence: 93,
    conditionalityRules: { productType: 'VENETIAN_BLIND_INTERNAL' },
    checklistItems: ['Hanger bracket fixed into glazing bead', 'Blind slat pack level', 'Cord locks functional'],
    evidenceRequirements: ['INTERNAL_VENETIAN_PHOTO'],
    expectedTools: ['2mm drill bit', 'Screwdriver'],
    preconditions: { dependsOn: ['SASH_REFIT'] },
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
