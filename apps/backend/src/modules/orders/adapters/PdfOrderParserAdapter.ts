import { IOrderParserAdapter, ParsedOrder } from '../interfaces/IOrderParserAdapter';

export class PdfOrderParserAdapter implements IOrderParserAdapter {
  async parse(fileBuffer: Buffer): Promise<ParsedOrder> {
    // Requirements explicitly state: Do not build OCR. Do not assume an API exists.
    // Stub adapter for PDF that raises a clear "not implemented" error.
    throw new Error('NotImplementedError: PDF parsing requires an OCR service which is not currently implemented.');
  }
}
