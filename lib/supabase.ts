import { createClient } from '@supabase/supabase-js';

// By putting the strings here, we don't have to worry about the .env file for now
const supabaseUrl = "https://vwlrghqcuyoyamurlcql.supabase.co";
const supabaseAnonKey = "sb_publishable_SM0SVl7REJILhwkU26KQfw_3zMj3tnQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);