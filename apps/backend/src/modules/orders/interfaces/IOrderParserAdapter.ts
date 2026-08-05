export interface ParsedItem {
  description: string;
  category: string; // "WINDOW", "DOOR", "ACCESSORY", "SERVICE"
  width?: number;
  height?: number;
  system?: string;
  glazing?: string;
  color?: string;
  handedness?: string;
  schematicUrl?: string;
}

export interface ParsedOrder {
  orderNumber: string;
  customerName?: string;
  items: ParsedItem[];
}

export interface IOrderParserAdapter {
  parse(fileBuffer: Buffer): Promise<ParsedOrder>;
}
