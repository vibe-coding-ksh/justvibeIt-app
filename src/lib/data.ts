import { databases } from './appwrite';
import { Query } from 'appwrite';
import type { PortfolioData, Profile, Project, SiteConfig, ProfileLink } from '@/types';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'main';

export async function loadPortfolioData(): Promise<PortfolioData> {
  const [configResult, profileResult, projectsResult] = await Promise.allSettled([
    databases.listDocuments(DATABASE_ID, 'site_config', [Query.limit(1)]),
    databases.listDocuments(DATABASE_ID, 'profiles', [Query.limit(1)]),
    databases.listDocuments(DATABASE_ID, 'projects', [Query.orderAsc('sort_order')]),
  ]);

  const configDoc = configResult.status === 'fulfilled' ? configResult.value.documents[0] : null;
  const profileDoc = profileResult.status === 'fulfilled' ? profileResult.value.documents[0] : null;
  const projectsDocs = projectsResult.status === 'fulfilled' ? projectsResult.value.documents : [];

  const config: SiteConfig = configDoc
    ? {
        id: configDoc.$id,
        site_name: configDoc.site_name || 'My Project',
        description: configDoc.description || '',
        theme: configDoc.theme || 'light',
      }
    : { site_name: 'My Project', description: '', theme: 'light' };

  let parsedLinks: ProfileLink[] = [];
  if (profileDoc?.links) {
    const rawLinks = profileDoc.links;
    if (Array.isArray(rawLinks)) {
      parsedLinks = rawLinks as ProfileLink[];
    } else if (typeof rawLinks === 'string') {
      try { parsedLinks = JSON.parse(rawLinks); } catch { parsedLinks = []; }
    }
  }

  const profile: Profile = profileDoc
    ? {
        id: profileDoc.$id,
        name: profileDoc.name || 'Set your name',
        title: profileDoc.title || '',
        bio: profileDoc.bio || '',
        avatar: profileDoc.avatar || '',
        links: parsedLinks,
        user_id: profileDoc.user_id,
      }
    : { name: 'Set your name', title: '', bio: '', avatar: '', links: [] };

  const projects: Project[] = projectsDocs.map((p) => ({
    id: p.$id,
    title: p.title || '',
    description: p.description || '',
    image: p.image || '',
    tags: p.tags || [],
    link: p.link || '',
    sort_order: p.sort_order,
    user_id: p.user_id,
    created_at: p.$createdAt,
  }));

  return { config, profile, projects };
}

export function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const basePath = import.meta.env.VITE_BASE_PATH || '/';
  const base = basePath.endsWith('/') ? basePath : basePath + '/';
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${clean}`;
}
