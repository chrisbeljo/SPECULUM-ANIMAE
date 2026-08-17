'use client'

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { Language } from '../translations'

const copy:Record<Language,{active:string;profile:string;history:string;subscription:string;settings:string;logout:string;unsubscribe:string;confirmUnsubscribe:string;deleting:string;close:string}>={
  ES:{active:"Cuenta activa",profile:"Mi perfil",history:"Historial",subscription:"Suscripción",settings:"Configuración",logout:"Cerrar sesión",unsubscribe:"Darse de baja",confirmUnsubscribe:"¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.",deleting:"Eliminando…",close:"Cerrar"},
  EN:{active:"Active account",profile:"My profile",history:"History",subscription:"Subscription",settings:"Settings",logout:"Sign out",unsubscribe:"Delete account",confirmUnsubscribe:"Are you sure you want to delete your account? This cannot be undone.",deleting:"Deleting…",close:"Close"},
  FR:{active:"Compte actif",profile:"Mon profil",history:"Historique",subscription:"Abonnement",settings:"Paramètres",logout:"Se déconnecter",unsubscribe:"Supprimer le compte",confirmUnsubscribe:"Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible.",deleting:"Suppression…",close:"Fermer"},
  DE:{active:"Aktives Konto",profile:"Mein Profil",history:"Verlauf",subscription:"Abonnement",settings:"Einstellungen",logout:"Abmelden",unsubscribe:"Konto löschen",confirmUnsubscribe:"Möchten Sie Ihr Konto wirklich löschen? Dies kann nicht rückgängig gemacht werden.",deleting:"Wird gelöscht…",close:"Schließen"},
  PT:{active:"Conta ativa",profile:"Meu perfil",history:"Histórico",subscription:"Assinatura",settings:"Configurações",logout:"Sair",unsubscribe:"Excluir conta",confirmUnsubscribe:"Tem certeza de que deseja excluir sua conta? Esta ação não pode ser desfeita.",deleting:"Excluindo…",close:"Fechar"}
};

export function Profile({ onLogout,onOpenProfile,onOpenHistory,lang="ES" }: { onLogout?: () => void;onOpenProfile?:()=>void;onOpenHistory?:()=>void;lang?:Language }) {
  const { user, logout, deleteAccount } = useAuth()
  const t=copy[lang]
  const [open,setOpen]=useState(false)
  const [deleting,setDeleting]=useState(false)
  const [deleteError,setDeleteError]=useState("")

  const handleLogout = async () => {
    await logout()
    setOpen(false)
    onLogout?.()
  }

  const handleOpenProfile = () => { setOpen(false); onOpenProfile?.() }
  const handleOpenHistory = () => { setOpen(false); onOpenHistory?.() }

  const handleUnsubscribe = async () => {
    if (!window.confirm(t.confirmUnsubscribe)) return
    setDeleteError("")
    setDeleting(true)
    try {
      await deleteAccount()
      setOpen(false)
      onLogout?.()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error')
    } finally {
      setDeleting(false)
    }
  }

  if (!user) return null

  return (
    <div className="profile-widget">
      <button type="button" className="profile-trigger" aria-expanded={open} aria-label={t.profile} onClick={()=>setOpen(o=>!o)}>
        <span className="profile-icon">👤</span>
      </button>

      {open && <div className="profile-backdrop" onClick={()=>setOpen(false)} />}

      {open && <div className="profile-menu">
        <button type="button" className="profile-close" aria-label={t.close} onClick={()=>setOpen(false)}>×</button>
        <div className="profile-header">
          <span className="profile-icon">👤</span>
          <div>
            <p className="profile-email">{user.email}</p>
            <small>{t.active}</small>
          </div>
        </div>

        <nav className="profile-nav">
          <button onClick={handleOpenProfile}>{t.profile}</button>
          <button onClick={handleOpenHistory}>{t.history}</button>
          <button>{t.subscription}</button>
          <button>{t.settings}</button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          ← {t.logout}
        </button>

        <button className="unsubscribe-btn" onClick={handleUnsubscribe} disabled={deleting}>
          {deleting?t.deleting:t.unsubscribe}
        </button>
        {deleteError && <p className="profile-delete-error">{deleteError}</p>}
      </div>}

      <style>{`
        .profile-widget {
          position: relative;
        }

        .profile-trigger {
          border: 1px solid #3a2c4a;
          background: #14101c;
          border-radius: 999px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
        }

        .profile-backdrop {
          position: fixed;
          inset: 0;
          z-index: 40;
          background: transparent;
        }

        .profile-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          z-index: 50;
          padding: 16px;
          border: 1px solid #3a2c4a;
          border-radius: 12px;
          background: #14101c;
          min-width: 220px;
          box-shadow: 0 12px 30px rgba(0,0,0,.45);
        }

        .profile-close {
          position: absolute;
          top: 8px;
          right: 10px;
          border: 0;
          background: transparent;
          color: #c8b7c8;
          font-size: 18px;
          cursor: pointer;
          line-height: 1;
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
          font-size: 20px;
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

        .unsubscribe-btn {
          width: 100%;
          margin-top: 8px;
          padding: 8px 12px;
          background: transparent;
          color: #756b7d;
          border: 1px solid #3a2c4a;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          transition: all 0.2s;
        }

        .unsubscribe-btn:hover {
          color: #d9534f;
          border-color: #d9534f;
        }

        .unsubscribe-btn:disabled {
          opacity: .6;
          cursor: default;
        }

        .profile-delete-error {
          margin: 8px 0 0;
          color: #efaca0;
          font-size: 11px;
          text-align: center;
        }
      `}</style>
    </div>
  )
}
