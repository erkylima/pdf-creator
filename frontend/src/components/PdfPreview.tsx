import React from 'react';

interface PdfPreviewProps {
  pages: string[];
  currentIndex: number;
  totalSlides: number;
  isLoading: boolean;
  error: string | null;
  onNext: () => void;
  onPrev: () => void;
}

export default function PdfPreview({
  pages,
  currentIndex,
  totalSlides,
  isLoading,
  error,
  onNext,
  onPrev,
}: PdfPreviewProps) {
  return (
    <div className="pdf-preview">
      <div className="preview-navigation">
        <button
          className="nav-btn"
          onClick={onPrev}
          disabled={currentIndex === 0}
        >
          ←
        </button>
        <span className="page-indicator">
          {currentIndex + 1} / {totalSlides}
        </span>
        <button
          className="nav-btn"
          onClick={onNext}
          disabled={currentIndex === totalSlides - 1}
        >
          →
        </button>
      </div>

      {isLoading && <p className="preview-status">Atualizando preview...</p>}
      {error && <p className="preview-error" role="alert">{error}</p>}
      {pages[currentIndex] ? (
        <img
          className="preview-document"
          alt={`Preview do slide ${currentIndex + 1}`}
          src={`data:image/png;base64,${pages[currentIndex]}`}
        />
      ) : (
        !isLoading && <p className="preview-status">O preview aparecerá aqui.</p>
      )}
    </div>
  );
}
