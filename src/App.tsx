import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import MainPage from './components/MainPage';
import type { User as AppUser } from './types';
import type { Session } from '@supabase/supabase-js';

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const mapUser = useCallback((session: Session | null): AppUser | null => {
    if (!session?.user) return null;
    const u = session.user;
    return {
      id: u.id,
      email: u.email || '',
      name: u.user_metadata?.full_name || u.user_metadata?.name || u.email || '',
      avatar_url: u.user_metadata?.avatar_url || '',
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapUser(session));
      setIsAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(mapUser(session));
      }
    );

    return () => subscription.unsubscribe();
  }, [mapUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="text-white text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <MainPage user={user} onLogout={handleLogout} />;
}
