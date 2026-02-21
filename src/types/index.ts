export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  link?: string;
  sort_order?: number;
  user_id?: string;
  created_at?: string;
}

export interface Profile {
  id?: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  links: ProfileLink[];
  user_id?: string;
}

export interface ProfileLink {
  label: string;
  url: string;
  icon?: string;
}

export interface SiteConfig {
  id?: string;
  site_name: string;
  description: string;
  theme: 'light' | 'dark';
}

export interface PortfolioData {
  config: SiteConfig;
  profile: Profile;
  projects: Project[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}
