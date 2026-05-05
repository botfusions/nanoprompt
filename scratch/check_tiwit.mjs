import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabase.turklawai.com';
const supabaseKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1OTA3MDIyMCwiZXhwIjo0OTE0NzQzODIwLCJyb2xlIjoiYW5vbiJ9.GhyoDRoTItfuiUtOWQD82zjras_rWUzChVK9bFJ1FMA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('tiwit').select('*').limit(2);
  console.log(JSON.stringify({ data, error }, null, 2));
}

check();
