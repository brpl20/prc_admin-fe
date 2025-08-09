import React, { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { useSession } from 'next-auth/react';
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
  const [currentTeam, setCurrentTeam] = useState<ITeam | null>(null);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [teamRole, setTeamRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const switchToTeam = async (teamId: number) => {
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
      if (session?.token) {
        const currentTeamData = await getCurrentTeam();
        setCurrentTeam(currentTeamData.team);
        setTeamRole(currentTeamData.role);
        const teamsData = await getTeams();
        setTeams(teamsData);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      refreshTeams();
    }
  }, [session]);

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