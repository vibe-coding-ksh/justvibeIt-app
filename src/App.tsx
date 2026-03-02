import { useState, useEffect, useCallback } from 'react';
import { account } from './lib/appwrite';
import { OAuthProvider } from 'appwrite';
import Login from './components/Login';
import MainPage from './components/MainPage';
import type { User as AppUser } from './types';

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      // Handle OAuth redirect: extract secret & userId from URL params
      const params = new URLSearchParams(window.location.search);
      const secret = params.get('secret');
      const userId = params.get('userId');

      if (secret && userId) {
        await account.createSession(userId, secret);
        window.history.replaceState({}, '', window.location.pathname);
      }

      const session = await account.get();
      setUser({
        id: session.$id,
        email: session.email || '',
        name: session.name || session.email || '',
        avatar_url: session.prefs?.avatar || '',
      });
    } catch {
      setUser(null);
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleLogin = async () => {
    const redirectUrl = window.location.origin + (import.meta.env.VITE_BASE_PATH || '/');
    account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUrl,
      redirectUrl
    );
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch {
      // Session may already be expired
    }
    setUser(null);
  };

  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <MainPage user={user} onLogout={handleLogout} />;
}
