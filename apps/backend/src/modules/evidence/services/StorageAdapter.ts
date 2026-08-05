import fs from 'fs';
import path from 'path';

export interface IStorageAdapter {
  save(buffer: Buffer, filename: string): Promise<string>;
  get(filename: string): Promise<Buffer>;
}

export class LocalDiskStorageAdapter implements IStorageAdapter {
  private baseDir: string;

  constructor(baseDir?: string) {
    // Default to an uploads folder in the backend root
    this.baseDir = baseDir || path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async save(buffer: Buffer, filename: string): Promise<string> {
    const fullPath = path.join(this.baseDir, filename);
    await fs.promises.writeFile(fullPath, buffer);
    // Return a logical URL that can be served or resolved later
    return `/uploads/${filename}`;
  }

  async get(filename: string): Promise<Buffer> {
    const fullPath = path.join(this.baseDir, filename);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${filename}`);
    }
    return fs.promises.readFile(fullPath);
  }
}
