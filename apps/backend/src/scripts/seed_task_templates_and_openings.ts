/**
 * Seed script: Task Templates (T1-T21) + Openings for Order 369264
 * Run with: npx ts-node src/scripts/seed_task_templates_and_openings.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TASK_TEMPLATES = [
  { code: 'T1',  nameEs: 'Extracción ventana antigua',    nameEn: 'Old window removal',            category: 'Extraction',  appliesWhen: 'always',                    evidenceRequired: true,  sequence: 1  },
  { code: 'T2',  nameEs: 'Extracción persiana antigua',   nameEn: 'Old shutter removal',           category: 'Extraction',  appliesWhen: 'has_old_shutter',           evidenceRequired: true,  sequence: 2  },
  { code: 'T3',  nameEs: 'Comprobación hueco',            nameEn: 'Opening check',                 category: 'Prep',        appliesWhen: 'always',                    evidenceRequired: false, sequence: 3  },
  { code: 'T4',  nameEs: 'Ampliación de hueco',           nameEn: 'Opening enlargement',           category: 'Prep',        appliesWhen: 'opening_undersized',        evidenceRequired: true,  sequence: 4  },
  { code: 'T5',  nameEs: 'Colocación ventana',            nameEn: 'Window placement',              category: 'Install',     appliesWhen: 'always',                    evidenceRequired: true,  sequence: 5  },
  { code: 'T6',  nameEs: 'Comprobación niveles',          nameEn: 'Level check',                   category: 'Install',     appliesWhen: 'always',                    evidenceRequired: true,  sequence: 6  },
  { code: 'T7',  nameEs: 'Anclaje químico',               nameEn: 'Chemical anchor',               category: 'Fixing',      appliesWhen: 'fixing_method==chemical',   evidenceRequired: true,  sequence: 7  },
  { code: 'T8',  nameEs: 'Anclaje / colocación anclajes', nameEn: 'Mechanical anchor',             category: 'Fixing',      appliesWhen: 'always',                    evidenceRequired: true,  sequence: 8  },
  { code: 'T9',  nameEs: 'Espuma perimetral interior',    nameEn: 'Interior perimeter foam',       category: 'Fixing',      appliesWhen: 'always',                    evidenceRequired: true,  sequence: 9  },
  { code: 'T10', nameEs: 'Espuma perimetral exterior',    nameEn: 'Exterior perimeter foam',       category: 'Fixing',      appliesWhen: 'always',                    evidenceRequired: true,  sequence: 10 },
  { code: 'T11', nameEs: 'Cortado tapa juntas interior',  nameEn: 'Interior trim cut',             category: 'Trim',        appliesWhen: 'always',                    evidenceRequired: true,  sequence: 11 },
  { code: 'T12', nameEs: 'Cortado tapa juntas exterior',  nameEn: 'Exterior trim cut',             category: 'Trim',        appliesWhen: 'always',                    evidenceRequired: true,  sequence: 12 },
  { code: 'T13', nameEs: 'Colocado tapa juntas interior', nameEn: 'Interior trim fit',             category: 'Trim',        appliesWhen: 'always',                    evidenceRequired: true,  sequence: 13 },
  { code: 'T14', nameEs: 'Colocado tapa juntas exterior', nameEn: 'Exterior trim fit',             category: 'Trim',        appliesWhen: 'always',                    evidenceRequired: true,  sequence: 14 },
  { code: 'T15', nameEs: 'Sellado tapa juntas interior',  nameEn: 'Interior trim seal',            category: 'Trim',        appliesWhen: 'always',                    evidenceRequired: true,  sequence: 15 },
  { code: 'T16', nameEs: 'Sellado tapa juntas exterior',  nameEn: 'Exterior trim seal',            category: 'Trim',        appliesWhen: 'always',                    evidenceRequired: true,  sequence: 16 },
  { code: 'T17', nameEs: 'Sellado inferior (Sikaflex)',   nameEn: 'Sill seal, interior + exterior',category: 'Trim',        appliesWhen: 'sill_at_floor_level',       evidenceRequired: true,  sequence: 17 },
  { code: 'T18', nameEs: 'Arreglo puntual de obra',       nameEn: 'Site-specific patch',           category: 'Masonry',     appliesWhen: 'manual',                    evidenceRequired: true,  sequence: 18 },
  { code: 'T19', nameEs: 'Parte obra/albañilería',        nameEn: 'Masonry follow-up (punch-list)',category: 'Masonry',     appliesWhen: 'always',                    evidenceRequired: false, sequence: 19 },
  { code: 'T20', nameEs: 'Instalación controlador Blebox',nameEn: 'Blebox shutter controller install', category: 'Automation', appliesWhen: 'has_motorized_shutter', evidenceRequired: true,  sequence: 20 },
  { code: 'T21', nameEs: 'Sincronización mando Blebox',   nameEn: 'Blebox remote sync/pairing',   category: 'Automation',  appliesWhen: 'has_motorized_shutter',     evidenceRequired: false, sequence: 21 },
];

// Load the seed JSON
import seedData from './369264_openings_seed.json';

function evaluateAppliesWhen(condition: string, opening: any): boolean {
  switch (condition) {
    case 'always':                   return true;
    case 'has_old_shutter':          return opening.has_old_shutter === true;
    case 'opening_undersized':       return opening.opening_undersized === true;
    case 'fixing_method==chemical':  return opening.fixing_method === 'chemical';
    case 'has_motorized_shutter':    return opening.has_motorized_shutter === true;
    case 'sill_at_floor_level':      return opening.sill_at_floor_level === true;
    case 'manual':                   return false; // Only added if explicitly in seed task_instances
    default:                         return false;
  }
}

async function main() {
  console.log('⚙️  Seeding Task Templates...');
  for (const t of TASK_TEMPLATES) {
    await prisma.taskTemplate.upsert({
      where: { code: t.code },
      update: t,
      create: t,
    });
  }
  console.log(`✅  ${TASK_TEMPLATES.length} task templates upserted.`);

  // Find the InstallationList for order 369264
  const order = await prisma.order.findUnique({ where: { orderNumber: '369264' } });
  if (!order) {
    console.error('❌  Order 369264 not found in DB. Run seed_order_369264.ts first.');
    process.exit(1);
  }
  const list = await prisma.installationList.findUnique({ where: { orderId: order.id } });
  if (!list) {
    console.error('❌  InstallationList for order 369264 not found.');
    process.exit(1);
  }

  // Seed crew members from job metadata
  const crewNames: string[] = (seedData as any).job.crew_observed;
  console.log(`⚙️  Seeding ${crewNames.length} crew members for list ${list.id}...`);
  for (const name of crewNames) {
    await prisma.crewMember.upsert({
      where: { listId_name: { listId: list.id, name } },
      update: {},
      create: { listId: list.id, name },
    });
  }

  // Get InstallationItems for image mapping
  const dbItems = await prisma.installationItem.findMany({ where: { listId: list.id } });

  console.log(`⚙️  Seeding ${(seedData as any).openings.length} openings...`);
  for (const op of (seedData as any).openings) {
    // Find matching InstallationItem for the schematic image
    const matchedItem = dbItems.find((item: any) => {
      const numMatch = item.description.match(/Item (\d+):/);
      const num = numMatch ? parseInt(numMatch[1]) : null;
      return num === op.drutex_item_no;
    });

    // Upsert the Opening record
    const opening = await prisma.opening.upsert({
      where: { id: op.opening_id } as any,
      update: {
        openingId:           op.opening_id,
        listId:              list.id,
        drutexItemNo:        op.drutex_item_no,
        matchConfidence:     op.match_confidence,
        matchNote:           op.match_note || null,
        location:            op.location,
        locationConfirmed:   op.location_confirmed,
        widthMm:             op.dimensions_mm?.width,
        heightMm:            op.dimensions_mm?.height,
        weightKg:            op.weight_kg,
        hasOldShutter:       op.has_old_shutter,
        openingUndersized:   op.opening_undersized,
        fixingMethod:        op.fixing_method,
        hasMotorizedShutter: op.has_motorized_shutter,
        motorCount:          op.motor_count,
        sillAtFloorLevel:    op.sill_at_floor_level,
        crewSizeObserved:    op.crew_size_observed,
        schematicUrl:        matchedItem?.schematicUrl || null,
        productType:         op.product_type,
        room:                op.location || 'Unknown',
        reference:           op.opening_id,
      },
      create: {
        id:                  op.opening_id,
        openingId:           op.opening_id,
        listId:              list.id,
        drutexItemNo:        op.drutex_item_no,
        matchConfidence:     op.match_confidence,
        matchNote:           op.match_note || null,
        location:            op.location,
        locationConfirmed:   op.location_confirmed,
        widthMm:             op.dimensions_mm?.width,
        heightMm:            op.dimensions_mm?.height,
        weightKg:            op.weight_kg,
        hasOldShutter:       op.has_old_shutter,
        openingUndersized:   op.opening_undersized,
        fixingMethod:        op.fixing_method,
        hasMotorizedShutter: op.has_motorized_shutter,
        motorCount:          op.motor_count,
        sillAtFloorLevel:    op.sill_at_floor_level,
        crewSizeObserved:    op.crew_size_observed,
        schematicUrl:        matchedItem?.schematicUrl || null,
        productType:         op.product_type,
        room:                op.location || 'Unknown',
        reference:           op.opening_id,
      },
    });

    // Collect task codes explicitly present in seed data
    const seedTaskCodes = new Set(op.task_instances.map((t: any) => t.code));

    // For each task template, evaluate if it applies to this opening
    for (const tmpl of TASK_TEMPLATES) {
      if (tmpl.code === 'T19') continue; // T19 handled as punch-list, not task instance

      const appliesFromCondition = evaluateAppliesWhen(tmpl.appliesWhen, op);
      const presentInSeed = seedTaskCodes.has(tmpl.code);
      if (!appliesFromCondition && !presentInSeed) continue;

      const seedTask = op.task_instances.find((t: any) => t.code === tmpl.code);
      const status = seedTask?.status === 'pendiente' ? 'outstanding' : (seedTask ? 'complete' : 'not_started');

      await prisma.taskInstance.upsert({
        where: { openingDbId_templateCode: { openingDbId: opening.id, templateCode: tmpl.code } },
        update: {
          status,
          responsible: seedTask?.responsible || null,
          timeMinutes:  seedTask?.time_min   || null,
          detail:       seedTask?.detail     || null,
          source:       seedTask?.source     || null,
        },
        create: {
          openingDbId:  opening.id,
          templateCode: tmpl.code,
          status,
          responsible:  seedTask?.responsible || null,
          timeMinutes:  seedTask?.time_min    || null,
          detail:       seedTask?.detail      || null,
          source:       seedTask?.source      || null,
        },
      });

      // Seed time logs if time_min exists and responsible has multiple people
      if (seedTask?.time_min && seedTask?.responsible) {
        const taskInst = await prisma.taskInstance.findUnique({
          where: { openingDbId_templateCode: { openingDbId: opening.id, templateCode: tmpl.code } }
        });
        if (taskInst) {
          const names = seedTask.responsible.split(',').map((n: string) => n.trim());
          const minutesEach = Math.round(seedTask.time_min / names.length);
          for (const name of names) {
            const existing = await prisma.taskTimeLog.findFirst({ where: { taskInstanceId: taskInst.id, personName: name } });
            if (!existing) {
              await prisma.taskTimeLog.create({ data: { taskInstanceId: taskInst.id, personName: name, minutes: minutesEach } });
            }
          }
        }
      }
    }

    // Seed T19 as MasonryPunchList
    const t19 = op.task_instances.find((t: any) => t.code === 'T19' || t.code === 'T19_inline');
    if (t19) {
      await prisma.masonryPunchList.upsert({
        where: { openingDbId: opening.id },
        update: { responsible: t19.responsible, detail: t19.detail || null },
        create: { openingDbId: opening.id, responsible: t19.responsible, detail: t19.detail || null },
      });
    }

    console.log(`  ✅  Opening ${op.opening_id} seeded.`);
  }

  console.log('\n🎉 Seed complete.');
}

main()
  .catch(err => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
