import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orderNumber = '369264';
  const customerName = 'MAMMUT_ENERGY (14 419)';

  // Delete existing order if any to avoid unique constraint error on reruns
  const existingOrder = await prisma.order.findUnique({
    where: { orderNumber }
  });

  if (existingOrder) {
    const list = await prisma.installationList.findUnique({ where: { orderId: existingOrder.id } });
    if (list) {
      await prisma.installationItem.deleteMany({ where: { listId: list.id } });
      await prisma.installationList.delete({ where: { id: list.id } });
    }
    await prisma.order.delete({ where: { id: existingOrder.id } });
    console.log('Deleted existing order 369264');
  }

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName,
      sourceData: {
        orderNumber,
        customerName,
        project: 'Sant Cugat, Barcelona Spain v10'
      }
    }
  });

  const list = await prisma.installationList.create({
    data: {
      orderId: order.id,
      status: 'DRAFT'
    }
  });

  const joineryItems = [
    { no: 1, desc: 'Window 2 chambers movable post', w: 1265, h: 1300, weight: 71.35, sys: 'IGLO EDGE - WINDOWS', color: 'White', img: '/order_images/item_1.png', qty: 1 },
    { no: 2, desc: '2-chambersbalcony door movable post', w: 1280, h: 2030, weight: 107.90, sys: 'IGLO EDGE - WINDOWS', color: 'White', img: '/order_images/item_2.png', qty: 1 },
    { no: 3, desc: '2-chambersbalcony door movable post', w: 1270, h: 2030, weight: 107.22, sys: 'IGLO EDGE - WINDOWS', color: 'White', img: '/order_images/item_3.png', qty: 1 },
    { no: 4, desc: 'Window 2 chambers movable post', w: 1270, h: 1040, weight: 58.87, sys: 'IGLO EDGE - WINDOWS', color: 'White', img: '/order_images/item_4.jpeg', qty: 1 },
    { no: 5, desc: '1-chamber window', w: 860, h: 830, weight: 32.11, sys: 'IGLO EDGE - WINDOWS', color: 'White', img: '/order_images/item_5.jpeg', qty: 1 },
    { no: 6, desc: '1-chamber window', w: 560, h: 820, weight: 22.57, sys: 'IGLO EDGE - WINDOWS', color: 'White', img: '/order_images/item_6.jpeg', qty: 1 },
    { no: 7, desc: '1-chamber window', w: 560, h: 820, weight: 22.57, sys: 'IGLO EDGE - WINDOWS', color: 'White', img: '/order_images/item_7.jpeg', qty: 1 },
    { no: 8, desc: 'Window 3-chambers movable post', w: 1270, h: 1300, weight: 71.53, sys: 'IGLO EDGE - WINDOWS', color: 'White', img: '/order_images/item_8.jpeg', qty: 1 },
    { no: 10, desc: 'Iglo Edge Slide A (2 kw.) otw. na prawo', w: 2000, h: 2100, weight: 179.39, sys: 'IGLO EDGE SLIDE', color: 'White', img: '/order_images/item_10.jpeg', qty: 1 },
    { no: 16, desc: 'Single-sash balcony door', w: 867, h: 2125, weight: 73.93, sys: 'IGLO EDGE - WINDOWS', color: 'Smooth basalt grey - REN. 701205-097', img: '/order_images/item_16.jpeg', qty: 1 },
    { no: 17, desc: '1-chamber window', w: 867, h: 1175, weight: 43.41, sys: 'IGLO EDGE - WINDOWS', color: 'Smooth basalt grey - REN. 701205-097', img: '/order_images/item_17.jpeg', qty: 1 }
  ];

  for (const item of joineryItems) {
    for (let i = 0; i < item.qty; i++) {
      await prisma.installationItem.create({
        data: {
          listId: list.id,
          type: 'JOINERY',
          category: 'WINDOW',
          description: `Item ${item.no}: ${item.desc}`,
          width: item.w,
          height: item.h,
          system: item.sys,
          color: item.color,
          weight: item.weight,
          schematicUrl: item.img,
          barcodeStatus: 'PENDING'
        }
      });
    }
  }

  const nonJoineryItems = [
    { no: 9, desc: 'Flat bar P04000023, 40x2,3mm 6000mm', qty: 10, cat: 'ACCESSORY' },
    { no: 11, desc: 'Flat bar P08000023, 80x2.3mm 6000mm', qty: 10, cat: 'ACCESSORY' },
    { no: 12, desc: 'STER_BLEBOX - uWIFI Blebox Shutterbox', qty: 5, cat: 'ACCESSORY' },
    { no: 13, desc: 'BLEBOX_BI - remote 12 channel', qty: 1, cat: 'ACCESSORY' },
    { no: 14, desc: 'BLEBOX_BI - remote 12 channel', qty: 3, cat: 'ACCESSORY' },
    { no: 15, desc: 'Flat bar P10000023, 100x2.3mm 6000mm', qty: 1, cat: 'ACCESSORY' },
  ];

  for (const item of nonJoineryItems) {
    for (let i = 0; i < item.qty; i++) {
      await prisma.installationItem.create({
        data: {
          listId: list.id,
          type: 'NON_JOINERY',
          category: item.cat,
          description: `Item ${item.no}: ${item.desc}`,
          barcodeStatus: 'PENDING'
        }
      });
    }
  }

  console.log('Successfully seeded order 369264 with joinery and non-joinery items.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
