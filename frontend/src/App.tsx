import React, { useEffect, useRef, useState } from 'react';
import { PdfModel, Slide, PdfConfig } from './types';
import SlideEditor from './components/SlideEditor';
import { PdfGenerator } from './components/PdfGenerator';
import PdfPreview from './components/PdfPreview';
import './styles.css';

const defaultSlide: Slide = {
  theme: 'dark',
  title: '',
  content: '',
};

const initialContent = {
  slides: [{ ...defaultSlide, title: 'Seu Título Aqui' }],
};

function App() {
  const [model, setModel] = useState<PdfModel>('impacto');
  const [slides, setSlides] = useState<Slide[]>(initialContent.slides);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
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
        const pages = await PdfGenerator.preview(config, photoFile, controller.signal);
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
  }, [model, slides, photoFile, showPreview]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const config: PdfConfig = { model, content: { slides } };
      await PdfGenerator.generate(config, photoFile);
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
          const json = JSON.parse(e.target?.result as string);
          if (json.slides && Array.isArray(json.slides)) {
            setSlides(json.slides);
            setCurrentSlideIndex(0);
          } else {
            alert('JSON inválido. Deve conter um array "slides".');
          }
        } catch (error) {
          alert('Erro ao ler JSON. Verifique o formato.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportJson = () => {
    const config: PdfConfig = { model, content: { slides } };
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

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
    }
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
                <div className="form-group">
                  <label>Foto pessoal:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                    id="photo-upload"
                  />
                  <button
                    className="btn btn-secondary"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    {photoFile ? 'Trocar Foto' : 'Carregar Foto'}
                  </button>
                  {photoFile && <span className="photo-status">✓ Foto carregada</span>}
                </div>
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
