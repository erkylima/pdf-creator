import { Router } from 'express';
import { Multer } from 'multer';
import { PdfController } from '../controllers/PdfController';

export function createPdfRoutes(pdfController: PdfController, upload: Multer): Router {
  const router = Router();
  const uploadPhotos = upload.fields([
    { name: 'photo1', maxCount: 1 },
    { name: 'photo2', maxCount: 1 },
    { name: 'photo3', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'background', maxCount: 1 },
  ]);

  router.post('/generate', uploadPhotos, (req, res) => pdfController.generate(req, res));
  router.post('/preview', uploadPhotos, (req, res) => pdfController.preview(req, res));

  return router;
}
