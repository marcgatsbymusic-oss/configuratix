import { describe, it, expect } from 'vitest';
import { PdfOrderParserAdapter } from '../adapters/PdfOrderParserAdapter';
import { CsvOrderParserAdapter } from '../adapters/CsvOrderParserAdapter';

describe('Order Parsers', () => {
  describe('PdfOrderParserAdapter', () => {
    it('should throw NotImplementedError as OCR is not implemented (FR-2.1 Constraint)', async () => {
      const adapter = new PdfOrderParserAdapter();
      
      await expect(adapter.parse(Buffer.from('fake pdf data')))
        .rejects
        .toThrow('NotImplementedError: PDF parsing requires an OCR service which is not currently implemented.');
    });
  });

  describe('CsvOrderParserAdapter', () => {
    it('should parse CSV correctly and map columns to items', async () => {
      const adapter = new CsvOrderParserAdapter();
      const csvData = `OrderNum,Customer
ORD-001,John Doe
,,WINDOW,Living Room Window,1200,1500,IGLO5,Double,White,Right
,,DOOR,Front Door,900,2100,IGLO5,None,Anthracite,Left
,,ACCESSORY,Handle,,,`;

      const result = await adapter.parse(Buffer.from(csvData));

      expect(result.orderNumber).toBe('ORD-001');
      expect(result.items.length).toBe(3);
      
      expect(result.items[0].category).toBe('WINDOW');
      expect(result.items[0].width).toBe(1200);
      expect(result.items[0].height).toBe(1500);
      
      expect(result.items[1].category).toBe('DOOR');
      expect(result.items[2].category).toBe('ACCESSORY');
      expect(result.items[2].width).toBeUndefined();
    });
  });
});
