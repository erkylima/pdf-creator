import { PdfConfig } from '../models/PdfConfig';

export interface PdfGeneratorPort {
  generate(config: PdfConfig): Promise<Buffer>;
  preview(config: PdfConfig): Promise<Buffer[]>;
}
