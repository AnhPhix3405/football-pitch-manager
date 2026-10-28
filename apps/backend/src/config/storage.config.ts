import { registerAs } from '@nestjs/config';

export const storageConfig = registerAs('storage', () => ({
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '',
  supabaseBucket:
    process.env.SUPABASE_STORAGE_BUCKET || 'football-pitch-manager',
}));
