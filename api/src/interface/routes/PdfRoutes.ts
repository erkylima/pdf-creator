import { Router } from 'express';
import { Multer } from 'multer';
import { PdfController } from '../controllers/PdfController';

export function createPdfRoutes(pdfController: PdfController, upload: Multer): Router {
  const router = Router();

  router.post('/generate', upload.single('photo'), (req, res) => pdfController.generate(req, res));
  router.post('/preview', upload.single('photo'), (req, res) => pdfController.preview(req, res));

  return router;
}
