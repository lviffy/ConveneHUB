import { createClient as createBrowserCompatClient } from '@/lib/supabase/client';

export const createClient = async () => createBrowserCompatClient();
export const createServerClient = createClient;
