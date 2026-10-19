import { PdfConfig, SlideBackground } from '../types';
import backgroundGoldArcsUrl from '../assets/background-gold-arcs.png';
import backgroundBlueGlowUrl from '../assets/background-blue-glow.png';
import backgroundEdgeSpecksUrl from '../assets/background-edge-specks.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const backgroundAssetUrls: Record<Exclude<SlideBackground, 'none' | 'custom'>, string> = {
  'gold-arcs': backgroundGoldArcsUrl,
  'blue-glow': backgroundBlueGlowUrl,
  'edge-specks': backgroundEdgeSpecksUrl,
};

export class PdfGenerator {
  static async generate(
    config: PdfConfig,
    photoFiles: Array<File | null>,
    backgroundFile: File | null = null,
  ): Promise<void> {
    const blob = await this.request(config, photoFiles, backgroundFile);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carrossel-${config.model}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  static async preview(
    config: PdfConfig,
    photoFiles: Array<File | null>,
    signal?: AbortSignal,
    backgroundFile: File | null = null,
  ): Promise<string[]> {
    const formData = await this.createFormData(config, photoFiles, backgroundFile);
    const response = await fetch(`${API_URL}/api/pdf/preview`, {
      method: 'POST',
      body: formData,
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to generate PDF preview (${response.status} ${response.statusText})`);
    }

    const result: unknown = await response.json();
    if (
      typeof result !== 'object' ||
      result === null ||
      !('pages' in result) ||
      !Array.isArray(result.pages) ||
      !result.pages.every((page): page is string => typeof page === 'string')
    ) {
      throw new Error('Invalid PDF preview response');
    }

    return result.pages;
  }

  private static async request(
    config: PdfConfig,
    photoFiles: Array<File | null>,
    backgroundFile: File | null,
    signal?: AbortSignal,
  ): Promise<Blob> {
    const response = await fetch(`${API_URL}/api/pdf/generate`, {
      method: 'POST',
      body: await this.createFormData(config, photoFiles, backgroundFile),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to generate PDF (${response.status} ${response.statusText})`);
    }

    return response.blob();
  }

  private static async createFormData(
    config: PdfConfig,
    photoFiles: Array<File | null>,
    backgroundFile: File | null,
  ): Promise<FormData> {
    const formData = new FormData();
    formData.append('config', JSON.stringify({
      model: config.model,
      content: config.content,
    }));
    photoFiles.forEach((photo, index) => {
      if (photo) {
        formData.append(`photo${index + 1}`, photo);
      }
    });
    if (backgroundFile) {
      formData.append('background', backgroundFile);
    }

    const selectedBackgrounds = new Set(
      config.content.slides
        .map((slide) => slide.background)
        .filter((background): background is keyof typeof backgroundAssetUrls => (
          background !== undefined && background in backgroundAssetUrls
        )),
    );
    await Promise.all([...selectedBackgrounds].map(async (background) => {
      const response = await fetch(backgroundAssetUrls[background]);
      if (!response.ok) {
        throw new Error(`Failed to load ${background} background (${response.status})`);
      }
      const blob = await response.blob();
      formData.append(`background-${background}`, blob, `${background}.png`);
    }));

    return formData;
  }
}
