import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://oepgqbkhkkgwsoxqaxlk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcGdxYmtoa2tnd3NveHFheGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTQxODAsImV4cCI6MjA3OTA3MDE4MH0.4nVFYeUntc5ng8GWkWURBzbmLkjVtvV1i4u5Q_UgBGQ";

export const supabase = createClient(supabaseUrl, supabaseKey);
