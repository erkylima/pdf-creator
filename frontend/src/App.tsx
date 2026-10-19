import React, { useEffect, useRef, useState } from 'react';
import { PdfModel, Slide, PdfConfig, Theme, PhotoPosition, PhotoId } from './types';
import SlideEditor from './components/SlideEditor';
import { PdfGenerator } from './components/PdfGenerator';
import PdfPreview from './components/PdfPreview';
import backgroundGoldArcsUrl from './assets/background-gold-arcs.png';
import backgroundBlueGlowUrl from './assets/background-blue-glow.png';
import backgroundEdgeSpecksUrl from './assets/background-edge-specks.png';
import './styles.css';

type BackgroundMode = 'none' | 'gold-arcs' | 'blue-glow' | 'edge-specks' | 'custom';

const backgroundTextureOptions: Record<
  Exclude<BackgroundMode, 'none' | 'custom'>,
  { url: string; filename: string }
> = {
  'gold-arcs': {
    url: backgroundGoldArcsUrl,
    filename: 'textura-arcos-dourados.png',
  },
  'blue-glow': {
    url: backgroundBlueGlowUrl,
    filename: 'textura-brilho-azul.png',
  },
  'edge-specks': {
    url: backgroundEdgeSpecksUrl,
    filename: 'textura-particulas-nas-bordas.png',
  },
};

const defaultSlide: Slide = {
  theme: 'dark',
  title: '',
  content: '',
};

const initialContent = {
  slides: [{ ...defaultSlide, title: 'Seu Título Aqui' }],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTheme(value: unknown): value is Theme | 'centered' {
  return value === 'dark' || value === 'light' || value === 'gold' || value === 'centered';
}

function isPhotoPosition(value: unknown): value is PhotoPosition {
  return value === 'bottom-left' || value === 'bottom-right' || value === 'center';
}

function isPdfModel(value: unknown): value is PdfModel {
  return value === 'impacto' || value === 'documental';
}

function isPhotoId(value: unknown): value is PhotoId {
  return value === 1 || value === 2 || value === 3;
}

function parseSlidesJson(value: unknown): { slides: Slide[]; model?: PdfModel } {
  if (!isRecord(value)) {
    throw new Error('O arquivo deve conter um objeto JSON.');
  }

  const content = isRecord(value.content) ? value.content : null;
  const slidesValue = content ? content.slides : value.slides;
  if (!Array.isArray(slidesValue) || slidesValue.length === 0) {
    throw new Error('O JSON deve conter um array "slides" não vazio.');
  }

  const slides = slidesValue.map((slide, index): Slide => {
    if (!isRecord(slide) || typeof slide.title !== 'string') {
      throw new Error(`O slide ${index + 1} deve ser um objeto com título em texto.`);
    }
    if (slide.theme !== undefined && !isTheme(slide.theme)) {
      throw new Error(`O tema do slide ${index + 1} não é válido.`);
    }
    if (slide.photo_position !== undefined && !isPhotoPosition(slide.photo_position)) {
      throw new Error(`A posição da foto no slide ${index + 1} não é válida.`);
    }
    if (
      (slide.tag !== undefined && typeof slide.tag !== 'string') ||
      (slide.content !== undefined && typeof slide.content !== 'string') ||
      (slide.cards_enabled !== undefined && typeof slide.cards_enabled !== 'boolean') ||
      (slide.photo_flip !== undefined && typeof slide.photo_flip !== 'boolean') ||
      (slide.hidden_logo !== undefined && typeof slide.hidden_logo !== 'boolean') ||
      (slide.scale !== undefined && typeof slide.scale !== 'number')
    ) {
      throw new Error(`Os campos do slide ${index + 1} têm valores inválidos.`);
    }
    if (slide.photo_id !== undefined && !isPhotoId(slide.photo_id)) {
      throw new Error(`A foto selecionada no slide ${index + 1} não é válida.`);
    }

    let cards: Slide['cards'];
    if (slide.cards !== undefined) {
      if (!Array.isArray(slide.cards)) {
        throw new Error(`Os cards do slide ${index + 1} têm formato inválido.`);
      }
      cards = slide.cards.map((card, cardIndex) => {
        if (
          !isRecord(card) ||
          typeof card.title !== 'string' ||
          (card.content !== undefined && typeof card.content !== 'string')
        ) {
          throw new Error(`O card ${cardIndex + 1} do slide ${index + 1} tem formato inválido.`);
        }
        return { title: card.title, content: card.content };
      });
    }

    return {
      theme: slide.theme === 'centered' ? 'dark' : slide.theme,
      photo_position: slide.photo_position,
      photo_id: slide.photo_id,
      photo_flip: slide.photo_flip,
      scale: slide.scale,
      tag: slide.tag,
      title: slide.title,
      content: slide.content,
      cards_enabled: slide.cards_enabled ?? (
        slide.theme === 'centered' || (Array.isArray(slide.cards) && slide.cards.length > 0)
      ),
      cards,
      hidden_logo: slide.hidden_logo,
    };
  });

  if (value.model !== undefined && !isPdfModel(value.model)) {
    throw new Error('O modelo da configuração exportada não é válido.');
  }

  return { slides, model: value.model };
}

function App() {
  const [model, setModel] = useState<PdfModel>('impacto');
  const [slides, setSlides] = useState<Slide[]>(initialContent.slides);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [photoFiles, setPhotoFiles] = useState<Array<File | null>>([null, null, null]);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('none');
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const addSlide = () => {
    setSlides([...slides, { ...defaultSlide }]);
  };

  const removeSlide = (index: number) => {
    if (slides.length > 1) {
      setSlides(slides.filter((_, i) => i !== index));
      if (currentSlideIndex >= slides.length - 1) {
        setCurrentSlideIndex(Math.max(0, slides.length - 2));
      }
    }
  };

  const updateSlide = (index: number, slide: Slide) => {
    const newSlides = [...slides];
    newSlides[index] = slide;
    setSlides(newSlides);
  };

  useEffect(() => {
    if (!showPreview) {
      setPreviewPages([]);
      setIsPreviewLoading(false);
      setPreviewError(null);
      return;
    }
    const controller = new AbortController();

    setIsPreviewLoading(true);
    setPreviewError(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        const config: PdfConfig = { model, content: { slides } };
        const pages = await PdfGenerator.preview(
          config,
          photoFiles,
          controller.signal,
          backgroundFile,
        );
        if (controller.signal.aborted) {
          return;
        }
        setPreviewPages(pages);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error('Error updating PDF preview:', error);
        setPreviewError('Não foi possível atualizar o preview. Verifique a conexão com a API.');
      } finally {
        if (!controller.signal.aborted) {
          setIsPreviewLoading(false);
        }
      }
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [model, slides, photoFiles, backgroundFile, showPreview]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const config: PdfConfig = { model, content: { slides } };
      await PdfGenerator.generate(config, photoFiles, backgroundFile);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Verifique o console.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = parseSlidesJson(JSON.parse(String(e.target?.result)));
          setSlides(parsed.slides);
          if (parsed.model) {
            setModel(parsed.model);
          }
          setCurrentSlideIndex(0);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro desconhecido.';
          alert(`Não foi possível carregar o JSON: ${message}`);
        }
      };
      reader.onerror = () => {
        alert('Não foi possível ler o arquivo JSON.');
      };
      reader.readAsText(file);
    }
  };

  const handleExportJson = () => {
    const config = { model, slides };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config-${model}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handlePhotoUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFiles((current) => current.map((photo, photoIndex) => (
        photoIndex === index ? file : photo
      )));
    }
  };

  const handleBackgroundModeChange = async (mode: BackgroundMode) => {
    setBackgroundMode(mode);
    if (mode === 'none' || mode === 'custom') {
      setBackgroundFile(null);
      if (mode === 'none') {
        const input = document.getElementById('background-upload');
        if (input instanceof HTMLInputElement) input.value = '';
      } else {
        document.getElementById('background-upload')?.click();
      }
      return;
    }

    setBackgroundFile(null);
    try {
      const textureOption = backgroundTextureOptions[mode];
      const response = await fetch(textureOption.url);
      if (!response.ok) {
        throw new Error(`Não foi possível carregar a textura (${response.status}).`);
      }
      const texture = await response.blob();
      setBackgroundFile(new File([texture], textureOption.filename, { type: texture.type }));
    } catch (error) {
      console.error('Error loading background texture:', error);
      setBackgroundMode('none');
      alert('Não foi possível carregar a textura de background.');
    }
  };

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackgroundFile(file);
      setBackgroundMode('custom');
    }
  };

  const removePhoto = (index: number) => {
    const input = document.getElementById(`photo-upload-${index + 1}`);
    if (input instanceof HTMLInputElement) {
      input.value = '';
    }
    setPhotoFiles((current) => current.map((photo, photoIndex) => (
      photoIndex === index ? null : photo
    )));
    setSlides((current) => current.map((slide) => (
      slide.photo_id === index + 1 ? { ...slide, photo_id: undefined } : slide
    )));
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="app">
      <header className="header">
        <h1>PDF Creator</h1>
        <p>Crie carrosséis para LinkedIn</p>
      </header>

      <main className="main">
        <div className="editor-container">
          <div className="editor-panel">
            <div className="config-section">
              <h2>Configuração</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="model-select">Modelo:</label>
                  <select
                    id="model-select"
                    value={model}
                    onChange={(e) => setModel(e.target.value as PdfModel)}
                  >
                    <option value="impacto">Impacto (1080x1350px)</option>
                    <option value="documental">Documental (1080x1350px)</option>
                  </select>
                </div>
                <div className="form-group photo-upload-group">
                  <label>Fotos (até 3):</label>
                  {photoFiles.map((photo, index) => (
                    <div className="photo-upload-slot" key={index}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handlePhotoUpload(index, event)}
                        style={{ display: 'none' }}
                        id={`photo-upload-${index + 1}`}
                      />
                      <button
                        className="btn btn-secondary btn-sm"
                        type="button"
                        onClick={() => document.getElementById(`photo-upload-${index + 1}`)?.click()}
                      >
                        {photo ? `Trocar foto ${index + 1}` : `Carregar foto ${index + 1}`}
                      </button>
                      {photo && (
                        <>
                          <span className="photo-status">{photo.name}</span>
                          <button
                            className="btn btn-danger btn-sm"
                            type="button"
                            onClick={() => removePhoto(index)}
                          >
                            Remover
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="background-mode">Background (aplicado em todos os slides):</label>
                <select
                  id="background-mode"
                  value={backgroundMode}
                  onChange={(event) => {
                    void handleBackgroundModeChange(event.target.value as BackgroundMode);
                  }}
                >
                  <option value="none">Sem background</option>
                  <option value="gold-arcs">Arcos dourados</option>
                  <option value="blue-glow">Brilho azul</option>
                  <option value="edge-specks">Partículas nas bordas</option>
                  <option value="custom">Enviar imagem...</option>
                </select>
                <input
                  id="background-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  style={{ display: 'none' }}
                />
                {backgroundFile && (
                  <div className="background-upload-status">
                    <span className="photo-status">{backgroundFile.name}</span>
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={() => document.getElementById('background-upload')?.click()}
                    >
                      Trocar imagem
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      type="button"
                      onClick={() => {
                        setBackgroundFile(null);
                        setBackgroundMode('none');
                        const input = document.getElementById('background-upload');
                        if (input instanceof HTMLInputElement) input.value = '';
                      }}
                    >
                      Remover background
                    </button>
                  </div>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Arquivo JSON:</label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleJsonUpload}
                    style={{ display: 'none' }}
                    id="json-upload"
                  />
                  <div className="button-group">
                    <button
                      className="btn btn-secondary"
                      onClick={() => document.getElementById('json-upload')?.click()}
                    >
                      Carregar JSON
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleExportJson}
                    >
                      Exportar JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="slides-section">
              <div className="slides-header">
                <h2>Slides ({slides.length})</h2>
                <button className="btn btn-secondary" onClick={addSlide}>
                  + Adicionar Slide
                </button>
              </div>

              <div className="slides-list">
                {slides.map((slide, index) => (
                  <SlideEditor
                    key={index}
                    slide={slide}
                    index={index}
                    photoFiles={photoFiles}
                    onUpdate={(s) => updateSlide(index, s)}
                    onRemove={() => removeSlide(index)}
                    canRemove={slides.length > 1}
                  />
                ))}
              </div>
            </div>

            <div className="actions-section">
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? 'Gerando...' : 'Gerar PDF'}
              </button>
            </div>
          </div>

          <div className="preview-panel">
            <div className="preview-header">
              <h2>Preview</h2>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {showPreview && (
              <PdfPreview
                pages={previewPages}
                currentIndex={currentSlideIndex}
                totalSlides={slides.length}
                isLoading={isPreviewLoading}
                error={previewError}
                onNext={nextSlide}
                onPrev={prevSlide}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
