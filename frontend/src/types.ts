export type PdfModel = 'impacto' | 'documental';

export type Theme = 'dark' | 'light' | 'gold';

export type SlideBackground = 'none' | 'gold-arcs' | 'blue-glow' | 'edge-specks' | 'custom';

export type PhotoPosition = 'bottom-right' | 'bottom-left' | 'center' | undefined;

export type PhotoId = 1 | 2 | 3;

export interface ContentCard {
  title: string;
  content?: string;
  theme?: Theme;
}

export interface Slide {
  theme?: Theme;
  background?: SlideBackground;
  photo_position?: PhotoPosition;
  photo_id?: PhotoId;
  photo_flip?: boolean;
  scale?: number;
  tag?: string;
  title: string;
  content?: string;
  cards_enabled?: boolean;
  cards?: ContentCard[];
  hidden_logo?: boolean;
}

export interface PdfContent {
  slides: Slide[];
}

export interface PdfConfig {
  model: PdfModel;
  content: PdfContent;
}
