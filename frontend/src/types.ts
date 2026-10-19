export type PdfModel = 'impacto' | 'documental';

export type Theme = 'dark' | 'light' | 'gold';

export type PhotoPosition = 'bottom-right' | 'bottom-left' | undefined;

export interface Slide {
  theme?: Theme;
  photo_position?: PhotoPosition;
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
}
