'use client'

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../supabase'

export function Comments() {
  const { user } = useAuth()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (user) {
      // Usuario registrado: guardar en BD
      try {
        const { error } = await supabase
          .from('comments')
          .insert({
            nombre: user.email?.split('@')[0] || 'Usuario',
            email: user.email || null,
            mensaje,
          })

        if (error) {
          setMessage({ type: 'error', text: 'Error al enviar. Intenta de nuevo' })
        } else {
          setMessage({ type: 'success', text: '¡Gracias por tu comentario! Lo hemos recibido.' })
          setMensaje('')
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Error de conexión' })
      }
    } else {
      // No registrado: copiar al portapapeles
      try {
        const msg = `SPECULUM ANIMAE COMENTARIO\n${new Date().toLocaleString()}\n\nNombre: ${nombre || 'Anónimo'}\nEmail: ${email || 'No proporcionado'}\n\nMensaje:\n${mensaje}`
        navigator.clipboard.writeText(msg)
        setMessage({ type: 'success', text: 'Comentario copiado. ¡Gracias por tu retroalimentación!' })
        setNombre('')
        setEmail('')
        setMensaje('')
      } catch (err) {
        setMessage({ type: 'error', text: 'Error al copiar' })
      }
    }
    setLoading(false)
  }

  return (
    <div className="comments-form">
      <div className="comments-content">
        <h3>Comparte tu experiencia</h3>
        <p>Tus comentarios nos ayudan a mejorar. Puedes dejarnos tu nombre y email (opcionales) o ser anónimo.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre (opcional)"
          disabled={loading}
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com (opcional)"
          disabled={loading}
        />

        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Tu comentario aquí..."
          required
          disabled={loading}
          rows={5}
        />

        <button type="submit" disabled={loading}>
          {loading ? (user ? 'Enviando...' : 'Copiando...') : (user ? 'Enviar' : 'Copiar para compartir')}
        </button>
      </form>

      {message && <div className={`comments-message ${message.type}`}>{message.text}</div>}

      {!user && (
        <p className="comments-note">Los comentarios se copian al portapapeles. Comparte con nosotros por email, WhatsApp o Telegram.</p>
      )}

      <style jsx>{`
        .comments-form {
          max-width: 500px;
          margin: 40px auto;
          padding: 30px;
          border: 1px solid #3a2c4a;
          border-radius: 14px;
          background: #14101c;
        }

        .comments-content h3 {
          margin: 0 0 8px;
          font-size: 20px;
          color: #ead3a7;
          font-family: "Gilda Display", serif;
        }

        .comments-content p {
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
        textarea {
          padding: 12px 14px;
          border: 1px solid #3a2c4a;
          border-radius: 8px;
          background: #1b1425;
          color: #eee4ef;
          font-size: 13px;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: #765d3b;
        }

        input::placeholder,
        textarea::placeholder {
          color: #8f7b99;
        }

        textarea {
          resize: vertical;
          min-height: 120px;
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

        .comments-message {
          margin-top: 16px;
          padding: 12px;
          border-radius: 8px;
          font-size: 12px;
          text-align: center;
        }

        .comments-message.success {
          background: rgba(113, 212, 154, 0.1);
          color: #71d49a;
          border: 1px solid #71d49a;
        }

        .comments-message.error {
          background: rgba(217, 83, 79, 0.1);
          color: #d9534f;
          border: 1px solid #d9534f;
        }

        .comments-note {
          margin-top: 16px;
          color: #8f7b99;
          font-size: 12px;
          line-height: 1.5;
          text-align: center;
        }
      `}</style>
    </div>
  )
}
