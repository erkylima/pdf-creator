import express, { Express } from 'express';
import cors from 'cors';
import multer from 'multer';
import { PuppeteerPdfGenerator } from './infrastructure/generators/PuppeteerPdfGenerator';
import { GeneratePdfUseCase } from './application/usecases/GeneratePdfUseCase';
import { PdfController } from './interface/controllers/PdfController';
import { createPdfRoutes } from './interface/routes/PdfRoutes';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  const pdfGenerator = new PuppeteerPdfGenerator();
  const generatePdfUseCase = new GeneratePdfUseCase(pdfGenerator);
  const pdfController = new PdfController(generatePdfUseCase);

  app.use('/api/pdf', createPdfRoutes(pdfController, upload));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}
