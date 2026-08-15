import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xenftrcqqhhrajatzhbq.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbmZ0cmNxcWhocmFqYXR6aGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NDkzMjksImV4cCI6MjEwMjEyNTMyOX0.ydGXZPq42fiKKWcnywoR8FJE4ytPdPLwH0zGYHt3PC0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
