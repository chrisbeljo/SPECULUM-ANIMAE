'use client'

import { useAuth } from '../hooks/useAuth'

export function Profile({ onLogout }: { onLogout?: () => void }) {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    onLogout?.()
  }

  if (!user) return null

  return (
    <div className="profile-menu">
      <div className="profile-header">
        <span className="profile-icon">👤</span>
        <div>
          <p className="profile-email">{user.email}</p>
          <small>Premium • Activo</small>
        </div>
      </div>

      <nav className="profile-nav">
        <button>Mi Perfil</button>
        <button>Historial</button>
        <button>Suscripción</button>
        <button>Configuración</button>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        ← Cerrar sesión
      </button>

      <style>{`
        .profile-menu {
          padding: 16px;
          border: 1px solid #3a2c4a;
          border-radius: 12px;
          background: #14101c;
          min-width: 200px;
        }

        .profile-header {
          display: flex;
          gap: 12px;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid #3a2c4a;
          margin-bottom: 12px;
        }

        .profile-icon {
          font-size: 28px;
        }

        .profile-email {
          margin: 0;
          font-size: 13px;
          color: #eee4ef;
          word-break: break-all;
        }

        .profile-header small {
          display: block;
          color: #d6b66d;
          font-size: 10px;
          letter-spacing: 0.1em;
          margin-top: 2px;
        }

        .profile-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 12px;
        }

        .profile-nav button {
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          color: #c8b7c8;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
          font-size: 12px;
          transition: all 0.2s;
        }

        .profile-nav button:hover {
          background: rgba(214, 182, 109, 0.1);
          color: #d6b66d;
        }

        .logout-btn {
          width: 100%;
          padding: 8px 12px;
          background: rgba(217, 83, 79, 0.1);
          color: #d9534f;
          border: 1px solid #d9534f;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: rgba(217, 83, 79, 0.2);
        }
      `}</style>
    </div>
  )
}
