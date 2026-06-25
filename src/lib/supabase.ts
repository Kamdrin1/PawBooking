import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://lszifwrtshljohauwnfq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzemlmd3J0c2hsam9oYXV3bmZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDM5OTQsImV4cCI6MjA5NDYxOTk5NH0.j5BkXL8Xfd0MlGIVAtxuLkL5fp-QBu72vxkT-MHMkz4.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  )
}