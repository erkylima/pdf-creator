import { Request, Response } from 'express';
import { GeneratePdfUseCase } from '../../application/usecases/GeneratePdfUseCase';
import { PdfConfig } from '../../domain/models/PdfConfig';

export class PdfController {
  constructor(private readonly generatePdfUseCase: GeneratePdfUseCase) {}

  async generate(req: Request, res: Response): Promise<void> {
    try {
      const config = this.getConfig(req, res);
      if (!config) return;

      const pdfBuffer = await this.generatePdfUseCase.execute(config);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="carrossel-${config.model}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }

  async preview(req: Request, res: Response): Promise<void> {
    try {
      const config = this.getConfig(req, res);
      if (!config) return;

      const pages = await this.generatePdfUseCase.preview(config);
      res.json({ pages: pages.map((page) => page.toString('base64')) });
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      res.status(500).json({ error: 'Failed to generate PDF preview' });
    }
  }

  private getConfig(req: Request, res: Response): PdfConfig | null {
    const configStr = req.body.config;
    const photoFile = req.file;

    if (!configStr) {
      res.status(400).json({ error: 'Missing config' });
      return null;
    }

    const config: PdfConfig = JSON.parse(configStr);
    if (!config.model || !config.content || !config.content.slides) {
      res.status(400).json({ error: 'Invalid PDF configuration' });
      return null;
    }

    const photoBase64 = photoFile
      ? `data:${photoFile.mimetype};base64,${photoFile.buffer.toString('base64')}`
      : null;

    return { ...config, photo: photoBase64 };
  }
}
