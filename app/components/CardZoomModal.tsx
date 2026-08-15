'use client'

import { useEffect } from 'react'

interface CardZoomModalProps {
  isOpen: boolean
  image?: string
  symbol?: string
  title: string
  position?: string
  meaning: string
  onClose: () => void
}

export function CardZoomModal({ isOpen, image, symbol, title, position, meaning, onClose }: CardZoomModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="card-zoom-overlay" onClick={onClose} role="presentation">
      <div className="card-zoom-modal" role="dialog" aria-modal="true" aria-labelledby="card-zoom-title" onClick={event => event.stopPropagation()}>
        <button className="card-zoom-close" onClick={onClose} aria-label="Cerrar carta ampliada">✕</button>
        <div className="card-zoom-content">
          {image ? (
            <img src={image} alt={title} className="card-zoom-image" />
          ) : symbol ? (
            <div className="card-zoom-symbol">{symbol}</div>
          ) : null}
          <div className="card-zoom-info">
            {position && <small>{position}</small>}
            <h3 id="card-zoom-title">{title}</h3>
            <p>{meaning}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card-zoom-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 2000;
          cursor: zoom-out;
          display: grid;
          place-items: center;
          padding: 18px;
        }

        .card-zoom-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2001;
          background: #14101c;
          border: 1px solid #3a2c4a;
          border-radius: 16px;
          padding: 24px;
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
        }

        .card-zoom-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          border: none;
          background: #3a2c4a;
          color: #d6b66d;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          display: grid;
          place-items: center;
          transition: all 0.2s;
          z-index: 2002;
        }

        .card-zoom-close:hover {
          background: #d6b66d;
          color: #160f1e;
        }

        .card-zoom-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .card-zoom-image {
          width: 100%;
          max-width: 400px;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .card-zoom-symbol {
          width: 200px;
          height: 200px;
          display: grid;
          place-items: center;
          font-size: 120px;
          border: 2px solid #d6b66d;
          border-radius: 12px;
          background: rgba(214, 182, 109, 0.05);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .card-zoom-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .card-zoom-info small {
          color: #d6b66d;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .card-zoom-info h3 {
          margin: 0;
          font-size: 24px;
          color: #ead3a7;
          font-family: "Gilda Display", serif;
        }

        .card-zoom-info p {
          margin: 0;
          color: #c8b7c8;
          font-size: 14px;
          line-height: 1.6;
        }

        @media (max-width: 800px) {
          .card-zoom-modal {
            width: min(92vw, 430px);
            padding: 18px;
            max-width: none;
            max-height: 88dvh;
          }

          .card-zoom-content {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .card-zoom-image {
            width: auto;
            max-width: 100%;
            max-height: 56dvh;
            margin: auto;
          }
        }
      `}</style>
    </div>
  )
}
