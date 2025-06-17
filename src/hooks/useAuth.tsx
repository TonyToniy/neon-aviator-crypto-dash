
import { useState, useEffect } from 'react';
import { db } from '@/integrations/postgresql/client';

interface User {
  id: number;
  email: string;
  created_at: string;
}

interface Session {
  user: User;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = db.auth.onAuthStateChange(
      (event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        });
      }
    );

    // Get initial session
    db.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await db.auth.signOut();
  };

  return {
    ...authState,
    signOut,
  };
};
