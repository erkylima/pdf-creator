export type PdfModel = 'impacto' | 'documental';

export interface Slide {
  theme?: 'dark' | 'light' | 'gold';
  photo_position?: 'bottom-right' | 'bottom-left';
  photo_flip?: boolean;
  scale?: number;
  tag?: string;
  title: string;
  content?: string;
  hidden_logo?: boolean;
}

export interface PdfContent {
  slides: Slide[];
}

export interface PdfConfig {
  model: PdfModel;
  content: PdfContent;
  photo?: string | null;
}
