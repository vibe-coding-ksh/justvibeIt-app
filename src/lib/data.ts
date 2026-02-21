import { supabase } from './supabase';
import type { PortfolioData, Profile, Project, SiteConfig, ProfileLink } from '@/types';

/**
 * Supabase에서 포트폴리오 데이터를 불러옵니다.
 * 테이블: site_config, profiles, projects
 */
export async function loadPortfolioData(): Promise<PortfolioData> {
  const [configResult, profileResult, projectsResult] = await Promise.all([
    supabase.from('site_config').select('*').limit(1).single(),
    supabase.from('profiles').select('*').limit(1).single(),
    supabase.from('projects').select('*').order('sort_order', { ascending: true }),
  ]);

  if (configResult.error && configResult.error.code !== 'PGRST116') {
    throw new Error('사이트 설정을 불러올 수 없어요: ' + configResult.error.message);
  }
  if (profileResult.error && profileResult.error.code !== 'PGRST116') {
    throw new Error('프로필을 불러올 수 없어요: ' + profileResult.error.message);
  }
  if (projectsResult.error) {
    throw new Error('프로젝트를 불러올 수 없어요: ' + projectsResult.error.message);
  }

  const config: SiteConfig = configResult.data
    ? {
        id: configResult.data.id,
        site_name: configResult.data.site_name || '내 프로젝트',
        description: configResult.data.description || '',
        theme: configResult.data.theme || 'light',
      }
    : { site_name: '내 프로젝트', description: '', theme: 'light' };

  const rawLinks = profileResult.data?.links;
  let parsedLinks: ProfileLink[] = [];
  if (Array.isArray(rawLinks)) {
    parsedLinks = rawLinks as ProfileLink[];
  } else if (typeof rawLinks === 'string') {
    try { parsedLinks = JSON.parse(rawLinks); } catch { parsedLinks = []; }
  }

  const profile: Profile = profileResult.data
    ? {
        id: profileResult.data.id,
        name: profileResult.data.name || '이름을 설정해주세요',
        title: profileResult.data.title || '',
        bio: profileResult.data.bio || '',
        avatar: profileResult.data.avatar || '',
        links: parsedLinks,
        user_id: profileResult.data.user_id,
      }
    : { name: '이름을 설정해주세요', title: '', bio: '', avatar: '', links: [] };

  const projects: Project[] = (projectsResult.data || []).map((p) => ({
    id: p.id,
    title: p.title || '',
    description: p.description || '',
    image: p.image || '',
    tags: p.tags || [],
    link: p.link || '',
    sort_order: p.sort_order,
    user_id: p.user_id,
    created_at: p.created_at,
  }));

  return { config, profile, projects };
}

/**
 * 이미지 URL을 반환합니다.
 * Supabase Storage URL(https://)이면 그대로, 아니면 로컬 경로로 처리합니다.
 */
export function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const basePath = import.meta.env.VITE_BASE_PATH || '/';
  const base = basePath.endsWith('/') ? basePath : basePath + '/';
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${clean}`;
}
