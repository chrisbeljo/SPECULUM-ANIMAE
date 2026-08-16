'use client'

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

type AuthMode = 'login' | 'register'

export function Auth({ onSuccess }: { onSuccess?: () => void }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'register') {
        await register(email, password, nombre)
      } else {
        await login(email, password)
      }
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-panel">
        <h2>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              <span>Nombre</span>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Tu nombre completo"
              />
            </label>
          )}

          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </label>

          <label>
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </label>

          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <button
          type="button"
          className="ghost"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError(null)
          }}
        >
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>

      <style>{`
        .auth-container {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 20px;
          background: radial-gradient(circle at 50% 15%, #27163b, #100b19 58%, #09070e);
        }

        .auth-panel {
          max-width: 400px;
          width: 100%;
          padding: 40px;
          border: 1px solid #3a2c4a;
          border-radius: 14px;
          background: #14101c;
        }

        .auth-panel h2 {
          margin: 0 0 24px;
          font-size: 28px;
          color: #ead3a7;
          font-family: "Gilda Display", serif;
        }

        .auth-error {
          margin-bottom: 16px;
          padding: 12px;
          border-radius: 8px;
          background: rgba(217, 83, 79, 0.1);
          color: #d9534f;
          font-size: 14px;
          border-left: 3px solid #d9534f;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        label span {
          font-size: 12px;
          color: #d6b66d;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        input {
          padding: 12px 14px;
          border: 1px solid #3a2c4a;
          border-radius: 8px;
          background: #1b1425;
          color: #eee4ef;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #765d3b;
        }

        button {
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 14px;
        }

        .primary {
          background: #d9b565;
          color: #160f1e;
        }

        .primary:hover:not(:disabled) {
          background: #ead3a7;
          transform: translateY(-2px);
        }

        .primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ghost {
          background: transparent;
          color: #d6b66d;
          border: 1px solid #d6b66d;
        }

        .ghost:hover {
          background: rgba(214, 182, 109, 0.1);
        }
      `}</style>
    </div>
  )
}
