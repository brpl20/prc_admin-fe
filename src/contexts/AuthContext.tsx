// contexts/AuthProvider.tsx
import { ReactNode, createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import jwt from 'jsonwebtoken';
import authService from '@/services/auth';
import { IAdmin, IProfileAdmin } from '@/interfaces/IAdmin';

interface AuthContextType {
  user: {
    profile: IProfileAdmin;
    admin: IAdmin;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token?: string;
  role?: string;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refetchUser: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [authState, setAuthState] = useState<Omit<AuthContextType, 'refetchUser' | 'logout'>>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Memoize the stable functions separately
  const refetchUser = useCallback(async () => {
    if (!session?.token) return;

    try {
      const decoded = jwt.decode(session.token) as { admin_id?: string };
      if (!decoded?.admin_id) throw new Error('Invalid token');

      const adminData = await authService.getAdminById(decoded.admin_id, session.token);
      const profileAdminId = adminData.data.relationships.profile_admin.data.id;
      const profileData = await authService.getProfileAdminById(profileAdminId, session.token);

      setAuthState({
        user: {
          admin: adminData.data,
          profile: profileData.data,
        },
        isLoading: false,
        isAuthenticated: true,
        token: session.token,
        role: session.role,
      });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, [session?.token]); // Only depend on token

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  // Initial fetch and session change handler
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated') {
      refetchUser();
    } else {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, [status, refetchUser]);

  // Combine stable state with stable functions
  const contextValue = {
    ...authState,
    refetchUser,
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
