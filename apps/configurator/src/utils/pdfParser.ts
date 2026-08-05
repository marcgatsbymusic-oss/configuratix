import * as pdfjsLib from 'pdfjs-dist';

// Use CDN for the worker to avoid Vite build configuration issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface ParsedWindowItem {
  id: string;
  reference: string;
  width?: number;
  height?: number;
  quantity: number;
  rawText: string;
}

/**
 * Extracts raw text from a PDF File object.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

/**
 * Very basic heuristic to find window items in raw text.
 * Searches for patterns like "Poz. 1", "W=1000", "H=1500", etc.
 * Since we don't know the exact format, this is a best-effort approach.
 */
export function parseDrutexItems(text: string): ParsedWindowItem[] {
  const items: ParsedWindowItem[] = [];
  
  // This is a naive split. We assume items might be separated by "Poz." or "Position"
  // Let's try to find blocks of text that might represent a window.
  // We'll look for "Poz" or "Item" or "Szt" (pieces).
  
  // A simple heuristic: find all matches of a dimension pattern (e.g. 1000 x 1500 or W=1000 H=1500)
  const dimensionRegex = /(?:W|Szerokość|Szer|Width)[\s:=]*(\d{3,4})[\s]*[x*X-]?[\s]*(?:H|Wysokość|Wys|Height)[\s:=]*(\d{3,4})/gi;
  
  // Also common: 1000x1500
  const simpleDimRegex = /(\d{3,4})\s*[xX]\s*(\d{3,4})/g;

  // Let's extract blocks by splitting on "Poz." or "Poz:" or "Pos."
  const blocks = text.split(/(?=Poz\.?\s*\d+|Position\s*\d+|Pos\.?\s*\d+)/i);
  
  blocks.forEach((block, index) => {
    if (!block.trim()) return;

    let width: number | undefined = undefined;
    let height: number | undefined = undefined;
    let reference = `Item ${index}`;
    let quantity = 1;

    // Try to find Poz number
    const pozMatch = block.match(/(?:Poz\.?|Position|Pos\.?)\s*(\d+)/i);
    if (pozMatch) {
      reference = `Poz. ${pozMatch[1]}`;
    }

    // Try to find quantity (e.g., "Szt: 2", "Ilość: 3", "Qty: 1")
    const qtyMatch = block.match(/(?:Szt\.?|Ilość|Qty|Quantity)[\s:=]*(\d+)/i);
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1], 10) || 1;
    }

    // Try to find dimensions
    let dimMatch = dimensionRegex.exec(block);
    if (dimMatch) {
      width = parseInt(dimMatch[1], 10);
      height = parseInt(dimMatch[2], 10);
    } else {
      // Fallback to simple dim regex
      dimMatch = simpleDimRegex.exec(block);
      if (dimMatch) {
        width = parseInt(dimMatch[1], 10);
        height = parseInt(dimMatch[2], 10);
      }
    }

    // If we found at least dimensions or a Poz reference, consider it an item
    if (width || pozMatch) {
      items.push({
        id: Date.now().toString(36) + Math.random().toString(36).substring(2) + index,
        reference,
        width,
        height,
        quantity,
        rawText: block.substring(0, 150).trim() + '...', // Store a snippet of raw text to help the user identify it
      });
    }
  });

  return items;
}
