
import { useState, useEffect } from 'react';
import { api, type User, type Session } from '@/lib/api';

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
    // Check for stored auth on initialization
    const storedUser = api.getStoredUser();
    const storedToken = api.getStoredToken();
    
    if (storedUser && storedToken) {
      // Create a basic session object from stored data
      const session: Session = {
        user: storedUser,
        access_token: storedToken,
        expires_at: Date.now() + 86400000, // 24 hours from now
      };
      
      setAuthState({
        user: storedUser,
        session,
        loading: false,
      });
    } else {
      setAuthState({
        user: null,
        session: null,
        loading: false,
      });
    }
  }, []);

  const signOut = async () => {
    await api.signOut();
    setAuthState({
      user: null,
      session: null,
      loading: false,
    });
  };

  return {
    ...authState,
    signOut,
  };
};
