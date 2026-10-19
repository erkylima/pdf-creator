import { PdfConfig } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class PdfGenerator {
  static async generate(config: PdfConfig, photoFile?: File | null): Promise<void> {
    const blob = await this.request(config, photoFile);
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
    photoFile?: File | null,
    signal?: AbortSignal,
  ): Promise<string[]> {
    const formData = this.createFormData(config, photoFile);
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
    photoFile?: File | null,
    signal?: AbortSignal,
  ): Promise<Blob> {
    const response = await fetch(`${API_URL}/api/pdf/generate`, {
      method: 'POST',
      body: this.createFormData(config, photoFile),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to generate PDF (${response.status} ${response.statusText})`);
    }

    return response.blob();
  }

  private static createFormData(config: PdfConfig, photoFile?: File | null): FormData {
    const formData = new FormData();
    formData.append('config', JSON.stringify({
      model: config.model,
      content: config.content,
    }));
    if (photoFile) {
      formData.append('photo', photoFile);
    }
    return formData;
  }
}
