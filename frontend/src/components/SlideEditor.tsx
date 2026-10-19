import React from 'react';
import { Slide, Theme, PhotoPosition } from '../types';

interface SlideEditorProps {
  slide: Slide;
  index: number;
  onUpdate: (slide: Slide) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export default function SlideEditor({ slide, index, onUpdate, onRemove, canRemove }: SlideEditorProps) {
  const handleChange = (field: keyof Slide, value: any) => {
    onUpdate({ ...slide, [field]: value });
  };

  return (
    <div className="slide-editor">
      <div className="slide-header">
        <h3>Slide {index + 1}</h3>
        {canRemove && (
          <button className="btn btn-danger btn-sm" onClick={onRemove}>
            Remover
          </button>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Tema:</label>
          <select
            value={slide.theme || 'dark'}
            onChange={(e) => handleChange('theme', e.target.value as Theme)}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="gold">Gold</option>
          </select>
        </div>

        <div className="form-group">
          <label>Posição Foto:</label>
          <select
            value={slide.photo_position || ''}
            onChange={(e) => handleChange('photo_position', e.target.value as PhotoPosition || undefined)}
          >
            <option value="">Sem foto</option>
            <option value="bottom-right">Inferior Direita</option>
            <option value="bottom-left">Inferior Esquerda</option>
          </select>
        </div>
      </div>

      {slide.photo_position && (
        <div className="form-row">
          <div className="form-group">
            <label>Escala (1-20):</label>
            <input
              type="number"
              min="1"
              max="20"
              step="0.1"
              value={slide.scale || 1}
              onChange={(e) => handleChange('scale', parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={slide.photo_flip || false}
                onChange={(e) => handleChange('photo_flip', e.target.checked)}
              />
              Espelhar foto
            </label>
          </div>
        </div>
      )}

      <div className="form-group">
        <label>Tag:</label>
        <input
          type="text"
          value={slide.tag || ''}
          onChange={(e) => handleChange('tag', e.target.value)}
          placeholder="Ex: CARREIRA EM IA"
        />
      </div>

      <div className="form-group">
        <label>Título:</label>
        <input
          type="text"
          value={slide.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Título do slide"
        />
      </div>

      <div className="form-group">
        <label>Conteúdo:</label>
        <textarea
          value={slide.content || ''}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="Conteúdo do slide (use Enter para quebrar linhas)"
          rows={4}
        />
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={slide.hidden_logo || false}
            onChange={(e) => handleChange('hidden_logo', e.target.checked)}
          />
          Ocultar logo
        </label>
      </div>
    </div>
  );
}
