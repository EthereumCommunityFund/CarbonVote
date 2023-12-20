// utils/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

import {Database} from '../database.types'



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


export const supabase = createClient(supabaseUrl, supabaseAnonKey);