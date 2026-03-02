import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./lib/appwrite', () => ({
  account: {
    get: vi.fn().mockRejectedValue(new Error('No session')),
  },
  databases: {},
  storage: {},
  client: {},
}));

vi.mock('appwrite', () => ({
  OAuthProvider: { Google: 'google' },
  Client: vi.fn(),
  Account: vi.fn(),
  Databases: vi.fn(),
  Storage: vi.fn(),
}));

describe('App', () => {
  it('renders login when not authenticated', async () => {
    render(<App />);
    const loginButton = await screen.findByText(/Sign in with Google/i);
    expect(loginButton).toBeInTheDocument();
  });
});
