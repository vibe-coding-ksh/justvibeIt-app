import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase 환경변수가 설정되지 않았어요. .env 파일을 확인해주세요.\n' +
    'VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY가 필요합니다.'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
