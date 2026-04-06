import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://iuaqxtadhkgcsjhyeybk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1YXF4dGFkaGtnY3NqaHlleWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNTQ1NzIsImV4cCI6MjA5MDkzMDU3Mn0.9i8pbPKA7QqQqkssZnVZpeO-_hhLeNLUPl_KSIEouFs'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)