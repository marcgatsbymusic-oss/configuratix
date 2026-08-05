import { PrismaClient } from '@prisma/client';

export class DeliveryService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Scan shipment order number to open the matching Installation List (FR-2.4)
   */
  async getInstallationListByShipment(shipmentNumber: string) {
    const list = await this.prisma.installationList.findFirst({
      where: {
        order: {
          orderNumber: shipmentNumber,
        }
      },
      include: {
        items: true,
        order: true,
      }
    });

    if (!list) {
      throw new Error(`No installation list found for shipment: ${shipmentNumber}`);
    }

    return list;
  }

  /**
   * Guided reconciliation checklist, item by item, confirmed by barcode scan (FR-2.5, FR-2.6)
   */
  async reconcileItem(itemId: string, scannedBarcode: string, status: string, userId: string) {
    const item = await this.prisma.installationItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    const updatedItem = await this.prisma.installationItem.update({
      where: { id: itemId },
      data: {
        scannedBarcode,
        barcodeStatus: status, // CONFIRMED
      }
    });

    return updatedItem;
  }

  /**
   * Discrepancy records with photos, blocking affected lines (FR-2.7)
   */
  async logDiscrepancy(itemId: string, type: string, reason: string, photoUrl: string | null, userId: string) {
    const discrepancy = await this.prisma.discrepancy.create({
      data: {
        itemId,
        type,
        reason,
        photoUrl,
        reportedBy: userId,
      }
    });

    await this.prisma.installationItem.update({
      where: { id: itemId },
      data: {
        barcodeStatus: 'DISCREPANCY'
      }
    });

    return discrepancy;
  }
}
