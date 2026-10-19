export type PdfModel = 'impacto' | 'documental';

export interface Slide {
  theme?: 'dark' | 'light' | 'gold';
  photo_position?: 'bottom-right' | 'bottom-left' | 'center';
  photo_id?: 1 | 2 | 3;
  photo_flip?: boolean;
  scale?: number;
  tag?: string;
  title: string;
  content?: string;
  cards_enabled?: boolean;
  cards?: { title: string; content?: string }[];
  hidden_logo?: boolean;
}

export interface PdfContent {
  slides: Slide[];
}

export interface PdfConfig {
  model: PdfModel;
  content: PdfContent;
  photos?: Array<string | null>;
  photo?: string | null;
  background?: string | null;
}
