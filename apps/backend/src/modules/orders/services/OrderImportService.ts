import { PrismaClient } from '@prisma/client';
import { IOrderParserAdapter } from '../interfaces/IOrderParserAdapter';

export class OrderImportService {
  constructor(private prisma: PrismaClient, private parser: IOrderParserAdapter) {}

  async importOrder(fileBuffer: Buffer) {
    const parsedOrder = await this.parser.parse(fileBuffer);

    // Create the Order
    const order = await this.prisma.order.create({
      data: {
        orderNumber: parsedOrder.orderNumber,
        customerName: parsedOrder.customerName,
        sourceData: JSON.parse(JSON.stringify(parsedOrder)), // Store snapshot
      }
    });

    // Create Installation List
    const list = await this.prisma.installationList.create({
      data: {
        orderId: order.id,
        status: 'DRAFT'
      }
    });

    // Classify and create items (FR-2.1)
    const joineryCategories = ['WINDOW', 'DOOR', 'SLIDER'];
    
    for (const item of parsedOrder.items) {
      const isJoinery = joineryCategories.includes(item.category.toUpperCase());
      
      await this.prisma.installationItem.create({
        data: {
          listId: list.id,
          type: isJoinery ? 'JOINERY' : 'NON_JOINERY',
          category: item.category,
          description: item.description,
          width: item.width,
          height: item.height,
          system: item.system,
          glazing: item.glazing,
          color: item.color,
          handedness: item.handedness,
          barcodeStatus: 'PENDING'
        }
      });
    }

    return await this.prisma.installationList.findUnique({
      where: { id: list.id },
      include: { items: true }
    });
  }
}
