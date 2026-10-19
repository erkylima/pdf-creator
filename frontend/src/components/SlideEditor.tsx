import React from 'react';
import { Slide, Theme, PhotoPosition, PhotoId } from '../types';

interface SlideEditorProps {
  slide: Slide;
  index: number;
  photoFiles: Array<File | null>;
  hasCustomBackground: boolean;
  onUpdate: (slide: Slide) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export default function SlideEditor({
  slide,
  index,
  photoFiles,
  hasCustomBackground,
  onUpdate,
  onRemove,
  canRemove,
}: SlideEditorProps) {
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
          <label htmlFor={`slide-${index}-background`}>Background deste slide:</label>
          <select
            id={`slide-${index}-background`}
            value={slide.background || 'none'}
            onChange={(e) => handleChange('background', e.target.value as Slide['background'])}
          >
            <option value="none">Nenhum (usar tema)</option>
            <option value="gold-arcs">Arcos dourados</option>
            <option value="blue-glow">Brilho azul</option>
            <option value="edge-specks">Partículas nas bordas</option>
            <option value="custom" disabled={!hasCustomBackground}>
              Imagem personalizada{hasCustomBackground ? '' : ' (carregue na configuração)'}
            </option>
          </select>
        </div>
        <div className="form-group">
          <label>Posição Foto:</label>
          <select
            value={slide.photo_position || ''}
            onChange={(e) => handleChange('photo_position', e.target.value as PhotoPosition || undefined)}
          >
            <option value="">Sem foto</option>
            <option value="center">Centralizada</option>
            <option value="bottom-right">Inferior Direita</option>
            <option value="bottom-left">Inferior Esquerda</option>
          </select>
        </div>
      </div>

      {slide.photo_position && (
        <div className="form-row">
          <div className="form-group">
            <label htmlFor={`slide-${index}-photo`}>Foto neste slide:</label>
            <select
              id={`slide-${index}-photo`}
              value={slide.photo_id || ''}
              onChange={(e) => handleChange(
                'photo_id',
                e.target.value ? Number(e.target.value) as PhotoId : undefined,
              )}
            >
              <option value="">Automática (primeira carregada ou padrão)</option>
              {photoFiles.map((photo, photoIndex) => photo && (
                <option key={photoIndex} value={photoIndex + 1}>
                  Foto {photoIndex + 1}: {photo.name}
                </option>
              )              )}
            </select>
          </div>
          <div className="form-group">
            <label>Escala da foto (1-20, 1 = normal):</label>
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
            checked={slide.cards_enabled || false}
            onChange={(e) => handleChange('cards_enabled', e.target.checked)}
          />
          Exibir conteúdo em card
        </label>
      </div>

      {slide.cards_enabled && (
        <div className="form-group content-cards-editor">
          <label>Cards dentro do card de conteúdo:</label>
          {(slide.cards || []).map((card, cardIndex) => (
            <div className="content-card-editor" key={cardIndex}>
              <div className="form-group">
                <label htmlFor={`slide-${index}-card-${cardIndex}-title`}>Título do card:</label>
                <input
                  id={`slide-${index}-card-${cardIndex}-title`}
                  type="text"
                  value={card.title}
                  onChange={(e) => {
                    const cards = [...(slide.cards || [])];
                    cards[cardIndex] = { ...card, title: e.target.value };
                    onUpdate({ ...slide, cards });
                  }}
                  placeholder="Ex: 75 horas"
                />
              </div>
              <div className="form-group">
                <label htmlFor={`slide-${index}-card-${cardIndex}-content`}>Detalhe:</label>
                <input
                  id={`slide-${index}-card-${cardIndex}-content`}
                  type="text"
                  value={card.content || ''}
                  onChange={(e) => {
                    const cards = [...(slide.cards || [])];
                    cards[cardIndex] = { ...card, content: e.target.value };
                    onUpdate({ ...slide, cards });
                  }}
                  placeholder="Ex: acesso vitalício"
                />
              </div>
              <div className="form-group">
                <label htmlFor={`slide-${index}-card-${cardIndex}-theme`}>Tema do card:</label>
                <select
                  id={`slide-${index}-card-${cardIndex}-theme`}
                  value={card.theme || slide.theme || 'dark'}
                  onChange={(e) => {
                    const cards = [...(slide.cards || [])];
                    cards[cardIndex] = { ...card, theme: e.target.value as Theme };
                    onUpdate({ ...slide, cards });
                  }}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="gold">Gold</option>
                </select>
              </div>
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={() => onUpdate({
                  ...slide,
                  cards: (slide.cards || []).filter((_, i) => i !== cardIndex),
                })}
              >
                Remover card
              </button>
            </div>
          ))}
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => onUpdate({
              ...slide,
              cards: [...(slide.cards || []), { title: '', content: '' }],
            })}
          >
            + Adicionar card interno
          </button>
        </div>
      )}

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
