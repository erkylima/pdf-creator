import { PdfConfig } from '../../domain/models/PdfConfig';
import { PdfGeneratorPort } from '../../domain/ports/PdfGeneratorPort';

export class GeneratePdfUseCase {
  constructor(private readonly pdfGenerator: PdfGeneratorPort) {}

  async execute(config: PdfConfig): Promise<Buffer> {
    return this.pdfGenerator.generate(config);
  }

  async preview(config: PdfConfig): Promise<Buffer[]> {
    return this.pdfGenerator.preview(config);
  }
}
