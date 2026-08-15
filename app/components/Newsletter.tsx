'use client'

import { useState } from 'react'
import { supabase } from '../supabase'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [contacto, setContacto] = useState('email')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          nombre: nombre || email,
          contacto,
          activo: true,
        })

      if (error) {
        if (error.code === '23505') {
          setMessage({ type: 'error', text: 'Este email ya está suscrito' })
        } else {
          setMessage({ type: 'error', text: 'Error al suscribirse. Intenta de nuevo' })
        }
      } else {
        setMessage({ type: 'success', text: '¡Suscrito! Recibirás actualizaciones pronto.' })
        setEmail('')
        setNombre('')
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="newsletter-form">
      <div className="newsletter-content">
        <h3>Recibe actualizaciones</h3>
        <p>Sé el primero en conocer nuevas disciplinas, mejoras y eventos especiales.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          disabled={loading}
        />

        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre (opcional)"
          disabled={loading}
        />

        <select value={contacto} onChange={(e) => setContacto(e.target.value)} disabled={loading}>
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="telegram">Telegram</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Suscribiendo...' : 'Suscribirse'}
        </button>
      </form>

      {message && <div className={`newsletter-message ${message.type}`}>{message.text}</div>}

      <style jsx>{`
        .newsletter-form {
          max-width: 500px;
          margin: 40px auto;
          padding: 30px;
          border: 1px solid #3a2c4a;
          border-radius: 14px;
          background: #14101c;
        }

        .newsletter-content h3 {
          margin: 0 0 8px;
          font-size: 20px;
          color: #ead3a7;
          font-family: "Gilda Display", serif;
        }

        .newsletter-content p {
          margin: 0 0 20px;
          color: #c8b7c8;
          font-size: 13px;
          line-height: 1.6;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        input,
        select {
          padding: 12px 14px;
          border: 1px solid #3a2c4a;
          border-radius: 8px;
          background: #1b1425;
          color: #eee4ef;
          font-size: 13px;
          transition: border-color 0.2s;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: #765d3b;
        }

        input::placeholder {
          color: #8f7b99;
        }

        button {
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          background: #d9b565;
          color: #160f1e;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        button:hover:not(:disabled) {
          background: #ead3a7;
          transform: translateY(-2px);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .newsletter-message {
          margin-top: 16px;
          padding: 12px;
          border-radius: 8px;
          font-size: 12px;
          text-align: center;
        }

        .newsletter-message.success {
          background: rgba(113, 212, 154, 0.1);
          color: #71d49a;
          border: 1px solid #71d49a;
        }

        .newsletter-message.error {
          background: rgba(217, 83, 79, 0.1);
          color: #d9534f;
          border: 1px solid #d9534f;
        }
      `}</style>
    </div>
  )
}
