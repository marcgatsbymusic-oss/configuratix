import { IOrderParserAdapter, ParsedOrder, ParsedItem } from '../interfaces/IOrderParserAdapter';

export class CsvOrderParserAdapter implements IOrderParserAdapter {
  async parse(fileBuffer: Buffer): Promise<ParsedOrder> {
    const csvContent = fileBuffer.toString('utf-8');
    const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length < 2) {
      throw new Error('CSV is empty or missing headers');
    }

    // Assuming headers: orderNumber, customerName, category, description, width, height, system, glazing, color, handedness
    // In a real CSV parser we'd use 'csv-parse' but for this adapter we do basic splitting
    
    // First line is headers or metadata? Let's assume order metadata is on first row or passed differently.
    // For simplicity of this adapter, let's say the first line is order info, second is headers, rest are items.
    // Actually, let's assume all lines are items, and orderNumber is in a column.
    
    const headers = lines[0].split(',').map(h => h.trim());
    
    const items: ParsedItem[] = [];
    let orderNumber = 'UNKNOWN';
    let customerName = '';

    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',').map(c => c.trim());
      
      // If it's the metadata row (OrderNum, Customer), read it
      if (columns[0] && columns[0] !== 'OrderNum') {
        orderNumber = columns[0];
        customerName = columns[1] || customerName;
      }
      
      // If there's an item category, read it
      if (columns[2]) {
        items.push({
          category: columns[2],
          description: columns[3] || 'Unknown Item',
          width: columns[4] ? parseFloat(columns[4]) : undefined,
          height: columns[5] ? parseFloat(columns[5]) : undefined,
          system: columns[6] || undefined,
          glazing: columns[7] || undefined,
          color: columns[8] || undefined,
          handedness: columns[9] || undefined,
        });
      }
    }

    return {
      orderNumber,
      customerName,
      items
    };
  }
}
