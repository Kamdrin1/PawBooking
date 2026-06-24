import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://lszifwrtshljohauwnfq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzemkxZndydHNobGpvaGF1d25maSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzE5MzMyNDI4LCJleHAiOjE3MzQ5ODQyMjh9.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  )
}