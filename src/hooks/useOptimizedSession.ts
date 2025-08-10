import { useSession } from 'next-auth/react';
import { useMemo, useRef } from 'react';

/**
 * Optimized session hook that reduces unnecessary re-renders and API calls
 * Caches session data and provides stable references
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
  const optimizedSession = useMemo(() => {
    if (!session) return null;
    
    return {
      id: session.id,
      email: session.email,
      name: session.name,
      last_name: session.last_name,
      teams: session.teams || [],
      current_team: session.current_team,
      team_role: session.team_role,
      needs_profile_setup: session.needs_profile_setup,
      // Add any other properties you need
    };
  }, [session?.id, session?.email, session?.name, session?.last_name, session?.teams, session?.current_team, session?.team_role, session?.needs_profile_setup]);

  // Memoize frequently used computed values
  const isAuthenticated = useMemo(() => {
    return Boolean(session?.id && session?.email);
  }, [session?.id, session?.email]);

  const isLoading = useMemo(() => {
    return status === 'loading';
  }, [status]);

  const isReady = useMemo(() => {
    return status !== 'loading';
  }, [status]);

  return {
    data: optimizedSession,
    session: optimizedSession, // alias for compatibility
    status,
    isAuthenticated,
    isLoading,
    isReady,
    update,
  };
};