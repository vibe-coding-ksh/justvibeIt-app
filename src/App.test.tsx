import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'test-id',
              email: 'test@example.com',
              user_metadata: { full_name: '테스트 유저' },
            },
          },
        },
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn(),
    },
  },
}));

vi.mock('./lib/data', () => ({
  loadPortfolioData: vi.fn().mockResolvedValue({
    config: { site_name: '내 프로젝트', description: '테스트', theme: 'light' },
    profile: {
      name: '테스트 유저',
      title: '개발자',
      bio: '안녕하세요',
      avatar: '',
      links: [],
    },
    projects: [],
  }),
  getImageUrl: vi.fn((path: string) => path),
}));

vi.mock('./lib/storage', () => ({
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
  getStorageUrl: vi.fn(),
  isStorageUrl: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('로그인된 상태에서 메인 페이지를 표시한다', async () => {
    const { default: App } = await import('./App');
    render(<App />);
    expect(await screen.findByText('테스트 유저')).toBeInTheDocument();
  });
});
