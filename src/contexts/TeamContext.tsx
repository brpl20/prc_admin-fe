import React, { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ITeam } from '@/interfaces/ITeam';
import { getCurrentTeam, switchTeam, getTeams } from '@/services/teams';

interface ITeamContextValue {
  currentTeam: ITeam | null;
  teams: ITeam[];
  setCurrentTeam: (team: ITeam | null) => void;
  setTeams: (teams: ITeam[]) => void;
  switchToTeam: (teamId: number) => Promise<void>;
  teamRole: string | null;
  isLoading: boolean;
  refreshTeams: () => Promise<void>;
}

interface IProps {
  children: ReactNode;
}

export const TeamContext = createContext<ITeamContextValue>({} as ITeamContextValue);

const TeamProvider = ({ children }: IProps) => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [currentTeam, setCurrentTeam] = useState<ITeam | null>(null);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [teamRole, setTeamRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const switchToTeam = async (teamId: number) => {
    // Don't allow team switching if user is not authenticated
    if (!session?.token || !session?.email) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      const response = await switchTeam(teamId);
      setCurrentTeam(response.team);
      setTeamRole(response.role);
      
      // Update session with new team data
      await update({
        ...session,
        current_team: response.team,
        team_role: response.role,
      });
    } catch (error) {
      console.error('Error switching team:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTeams = async () => {
    try {
      setIsLoading(true);
      
      // Verify authentication before making API calls
      const isAuthenticated = session && 
                             session.token && 
                             typeof session.token === 'string' && 
                             session.token.trim() !== '' &&
                             session.token !== 'undefined' &&
                             session.email &&
                             typeof session.email === 'string' &&
                             session.email.trim() !== '';
      
      if (!isAuthenticated) {
        setCurrentTeam(null);
        setTeams([]);
        setTeamRole(null);
        return;
      }
      
      const currentTeamData = await getCurrentTeam();
      setCurrentTeam(currentTeamData.team);
      setTeamRole(currentTeamData.role);
      const teamsData = await getTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching team data:', error);
      // Clear team data on error (likely auth failure)
      setCurrentTeam(null);
      setTeams([]);
      setTeamRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // List of public routes that don't need team data
    const publicRoutes = ['/', '/login', '/register'];
    const isPublicRoute = publicRoutes.includes(router.pathname);
    
    // Don't load teams on public routes
    if (isPublicRoute) {
      setCurrentTeam(null);
      setTeams([]);
      setTeamRole(null);
      setIsLoading(false);
      return;
    }
    
    // Don't run if no session at all
    if (!session) {
      setCurrentTeam(null);
      setTeams([]);
      setTeamRole(null);
      setIsLoading(false);
      return;
    }
    
    // Check if this is a valid authenticated session
    const isAuthenticated = session.token && 
                           typeof session.token === 'string' && 
                           session.token.trim() !== '' &&
                           session.token !== 'undefined' &&
                           session.email &&
                           typeof session.email === 'string' &&
                           session.email.trim() !== '';
    
    if (isAuthenticated) {
      refreshTeams();
    } else {
      setCurrentTeam(null);
      setTeams([]);
      setTeamRole(null);
      setIsLoading(false);
    }
  }, [session, router.pathname]);

  return (
    <TeamContext.Provider
      value={{
        currentTeam,
        teams,
        setCurrentTeam,
        setTeams,
        switchToTeam,
        teamRole,
        isLoading,
        refreshTeams,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export default TeamProvider;

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};