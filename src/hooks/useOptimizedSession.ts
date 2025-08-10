import { useSession } from 'next-auth/react';
import { useMemo, useRef, useCallback } from 'react';

// Define session type based on our NextAuth configuration
interface OptimizedSessionData {
  id: string;
  email: string;
  name?: string;
  last_name?: string;
  teams?: any[];
  current_team?: any;
  team_role?: string;
  needs_profile_setup?: boolean;
}

/**
 * Optimized session hook that reduces unnecessary re-renders and API calls
 * Caches session data and provides stable references with proper type safety
 */
export const useOptimizedSession = () => {
  const { data: session, status, update } = useSession();
  const sessionRef = useRef(session);
  const statusRef = useRef(status);

  // Update refs when session changes
  if (session !== sessionRef.current) {
    sessionRef.current = session;
  }
  
  if (status !== statusRef.current) {
    statusRef.current = status;
  }

  // Memoize session properties to prevent unnecessary re-renders
  const optimizedSession = useMemo((): OptimizedSessionData | null => {
    if (!session) return null;
    
    // Type-safe access to session properties (NextAuth returns user object directly)
    const sessionData = session as any;
    
    return {
      id: sessionData.id || '',
      email: sessionData.email || '',
      name: sessionData.name || '',
      last_name: sessionData.last_name || '',
      teams: sessionData.teams || [],
      current_team: sessionData.current_team || null,
      team_role: sessionData.team_role || '',
      needs_profile_setup: sessionData.needs_profile_setup || false,
    };
  }, [session]);

  // Memoize frequently used computed values
  const isAuthenticated = useMemo(() => {
    return Boolean(optimizedSession?.id && optimizedSession?.email);
  }, [optimizedSession?.id, optimizedSession?.email]);

  const isLoading = useMemo(() => {
    return status === 'loading';
  }, [status]);

  const isReady = useMemo(() => {
    return status !== 'loading';
  }, [status]);

  // Stable update function with proper typing
  const stableUpdate = useCallback((data?: any) => {
    return update(data);
  }, [update]);

  return {
    data: optimizedSession,
    session: optimizedSession, // alias for compatibility
    status,
    isAuthenticated,
    isLoading,
    isReady,
    update: stableUpdate,
  };
};