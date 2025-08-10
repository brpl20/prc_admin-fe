import api from './api';
import { getSession } from 'next-auth/react';
import { apiCache, getCacheKey, CACHE_DURATION } from '@/utils/apiCache';
import {
  ITeam,
  ICreateTeamData,
  IUpdateTeamData,
  ITeamInvite,
  ITeamMember,
  ISubscription,
  ISubscriptionPlan,
} from '@/interfaces/ITeam';

export interface ITeamMembership {
  id: number;
  team_id: number;
  admin_id: number;
  role: 'owner' | 'admin' | 'member';
  status: string;
  joined_at: string;
}

export interface IInviteData {
  email: string;
  role: 'admin' | 'member';
}

class TeamService {
  // Helper method to check authentication before API calls
  private async ensureAuthenticated(): Promise<void> {
    const session = await getSession();
    
    if (!session || !session.token || !session.email) {
      throw new Error('User not authenticated - cannot access team data');
    }
    
    // Additional check - ensure token is not empty string
    if (typeof session.token !== 'string' || session.token.trim() === '') {
      throw new Error('Invalid authentication token');
    }
  }

  // Team CRUD operations
  async listTeams(): Promise<ITeam[]> {
    await this.ensureAuthenticated();
    
    const cacheKey = getCacheKey('/teams');
    return apiCache.cachedApiCall(
      cacheKey,
      async () => {
        const response = await api.get('/teams');
        return response.data;
      },
      CACHE_DURATION.MEDIUM
    );
  }

  async getTeam(id: number): Promise<ITeam> {
    await this.ensureAuthenticated();
    const response = await api.get(`/teams/${id}`);
    return response.data;
  }

  async getTeamById(id: number): Promise<ITeam> {
    return this.getTeam(id);
  }

  async createTeam(data: ICreateTeamData): Promise<ITeam> {
    await this.ensureAuthenticated();
    const formData = new FormData();
    formData.append('team[name]', data.name);
    if (data.description) {
      formData.append('team[description]', data.description);
    }
    if (data.logo) {
      formData.append('team[logo]', data.logo);
    }

    const response = await api.post('/teams', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateTeam(id: number, data: IUpdateTeamData): Promise<ITeam> {
    await this.ensureAuthenticated();
    const formData = new FormData();
    if (data.name) {
      formData.append('team[name]', data.name);
    }
    if (data.subdomain) {
      formData.append('team[subdomain]', data.subdomain);
    }
    if (data.description) {
      formData.append('team[description]', data.description);
    }
    if (data.logo) {
      formData.append('team[logo]', data.logo);
    }
    if (data.settings) {
      formData.append('team[settings]', JSON.stringify(data.settings));
    }

    const response = await api.patch(`/teams/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Invalidate cache when team is updated
    apiCache.delete(getCacheKey('/teams'));
    apiCache.delete(getCacheKey(`/teams/${id}`));
    
    return response.data;
  }

  async deleteTeam(id: number): Promise<void> {
    await this.ensureAuthenticated();
    await api.delete(`/teams/${id}`);
  }

  // Team Member operations
  async getTeamMembers(teamId: number) {
    try {
      await this.ensureAuthenticated();
      const response = await api.get(`/teams/${teamId}/members`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async addTeamMember(teamId: number, invite: ITeamInvite): Promise<ITeamMember> {
    const response = await api.post(`/teams/${teamId}/add_member`, {
      member: invite,
    });
    return response.data;
  }

  async removeTeamMember(teamId: number, memberId: number): Promise<void> {
    await api.delete(`/teams/${teamId}/members/${memberId}`);
  }

  async updateTeamMember(teamId: number, memberId: number, role: string) {
    try {
      const response = await api.put(`/teams/${teamId}/members/${memberId}`, { role });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateMemberRole(
    teamId: number,
    memberId: number,
    role: ITeamMember['role']
  ): Promise<ITeamMember> {
    const response = await api.patch(`/teams/${teamId}/members/${memberId}`, {
      member: { role },
    });
    return response.data;
  }

  // Team switching
  async switchTeam(teamId: number) {
    try {
      await this.ensureAuthenticated();
      const response = await api.post(`/teams/${teamId}/switch`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get current team
  async getCurrentTeam() {
    try {
      await this.ensureAuthenticated();
      // Get all teams - the backend returns teams ordered by membership,
      // so the first team should be the current/primary team
      const response = await api.get('/teams');
      const teams = response.data;
      
      if (teams && teams.length > 0) {
        const currentTeam = teams[0];
        
        // TODO: Determine actual role from team membership data
        // For now, default to 'owner' but this should be improved
        const role = 'owner';
        
        return {
          team: currentTeam,
          role: role
        };
      }
      
      throw new Error('No teams found for current user');
    } catch (error) {
      console.error('Error fetching current team:', error);
      throw error;
    }
  }

  // Subscription operations
  async getSubscription(teamId: number): Promise<ISubscription> {
    const response = await api.get(`/subscriptions/${teamId}`);
    return response.data;
  }

  async createSubscription(planId: number): Promise<ISubscription> {
    const response = await api.post('/subscriptions', {
      subscription: {
        subscription_plan_id: planId,
      },
    });
    return response.data;
  }

  async updateSubscription(id: number, status: ISubscription['status']): Promise<ISubscription> {
    const response = await api.patch(`/subscriptions/${id}`, {
      subscription: { status },
    });
    return response.data;
  }

  async cancelSubscription(id: number): Promise<ISubscription> {
    const response = await api.patch(`/subscriptions/${id}/cancel`);
    return response.data;
  }

  async getSubscriptionPlans(): Promise<ISubscriptionPlan[]> {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  }

  async getUsageStatistics(teamId: number): Promise<ISubscription['usage']> {
    const response = await api.get('/subscriptions/usage');
    return response.data;
  }
}

const teamService = new TeamService();

// Export both individual functions for backwards compatibility and the service class
export const getTeams = () => teamService.listTeams();
export const getTeamById = (id: number) => teamService.getTeamById(id);
export const createTeam = (data: ICreateTeamData) => teamService.createTeam(data);
export const updateTeam = (id: number, data: IUpdateTeamData) => teamService.updateTeam(id, data);
export const deleteTeam = (id: number) => teamService.deleteTeam(id);
export const getTeamMembers = (teamId: number) => teamService.getTeamMembers(teamId);
export const addTeamMember = (teamId: number, data: ITeamInvite) => teamService.addTeamMember(teamId, data);
export const updateTeamMember = (teamId: number, memberId: number, role: string) => teamService.updateTeamMember(teamId, memberId, role);
export const removeTeamMember = (teamId: number, memberId: number) => teamService.removeTeamMember(teamId, memberId);
export const switchTeam = (teamId: number) => teamService.switchTeam(teamId);
export const getCurrentTeam = () => teamService.getCurrentTeam();

export default teamService;