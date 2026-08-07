// Public-safe credentials — the publishable/anon key is meant to be
// exposed in client-side code. Write access to `months` and the
// `photos` bucket is only possible via the Supabase dashboard (your own
// login), never via this key. See supabase/schema.sql for the policies.
const SUPABASE_URL = 'https://daqixovmlivnbxerpdfj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5WlG2AXh6yfGRziM1qoX_Q_73L9p69_';

const supabaseClient =
  typeof window.supabase !== 'undefined'
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
