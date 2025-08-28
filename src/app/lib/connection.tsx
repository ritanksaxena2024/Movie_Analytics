
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rnoypcwwoylgralwesml.supabase.co'
const supabaseKey = process.env.SUPABASE_DB_CONNECTION ?? ''
export const supabase = createClient(supabaseUrl, supabaseKey)