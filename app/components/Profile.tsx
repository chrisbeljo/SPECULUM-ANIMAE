'use client'

import { useAuth } from '../hooks/useAuth'
import type { Language } from '../translations'

const copy:Record<Language,{active:string;profile:string;history:string;subscription:string;settings:string;logout:string}>={ES:{active:"Cuenta activa",profile:"Mi perfil",history:"Historial",subscription:"Suscripción",settings:"Configuración",logout:"Cerrar sesión"},EN:{active:"Active account",profile:"My profile",history:"History",subscription:"Subscription",settings:"Settings",logout:"Sign out"},FR:{active:"Compte actif",profile:"Mon profil",history:"Historique",subscription:"Abonnement",settings:"Paramètres",logout:"Se déconnecter"},DE:{active:"Aktives Konto",profile:"Mein Profil",history:"Verlauf",subscription:"Abonnement",settings:"Einstellungen",logout:"Abmelden"},PT:{active:"Conta ativa",profile:"Meu perfil",history:"Histórico",subscription:"Assinatura",settings:"Configurações",logout:"Sair"}};

export function Profile({ onLogout,onOpenProfile,onOpenHistory,lang="ES" }: { onLogout?: () => void;onOpenProfile?:()=>void;onOpenHistory?:()=>void;lang?:Language }) {
  const { user, logout } = useAuth()
  const t=copy[lang]

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
          <small>{t.active}</small>
        </div>
      </div>

      <nav className="profile-nav">
        <button onClick={onOpenProfile}>{t.profile}</button>
        <button onClick={onOpenHistory}>{t.history}</button>
        <button>{t.subscription}</button>
        <button>{t.settings}</button>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        ← {t.logout}
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
