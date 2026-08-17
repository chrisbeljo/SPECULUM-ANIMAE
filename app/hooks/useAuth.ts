import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Obtener sesión actual
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener sesión')
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const register = async (email: string, password: string, nombre: string) => {
    try {
      setError(null)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // No depender solo del "Site URL" del dashboard de Supabase (queda mal
          // configurado con facilidad, p.ej. apuntando a localhost tras pruebas
          // locales): siempre volver al origen real desde donde se registró.
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      })

      if (signUpError) throw signUpError

      // Crear perfil de usuario
      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email,
          nombre,
          perfil_datos: {},
        })
      }

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error en registro'
      setError(message)
      throw err
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(message)
      throw err
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await supabase.auth.signOut()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cerrar sesión'
      setError(message)
      throw err
    }
  }

  const deleteAccount = async () => {
    try {
      setError(null)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No hay una sesión activa')
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'No se pudo eliminar la cuenta')
      }
      await supabase.auth.signOut()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar la cuenta'
      setError(message)
      throw err
    }
  }

  return { user, loading, error, register, login, logout, deleteAccount }
}
