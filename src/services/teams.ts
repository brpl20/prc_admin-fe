import api from './api';
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
  // Team CRUD operations
  async listTeams(): Promise<ITeam[]> {
    const response = await api.get('/teams');
    return response.data;
  }

  async getTeam(id: number): Promise<ITeam> {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  }

  async getTeamById(id: number): Promise<ITeam> {
    return this.getTeam(id);
  }

  async createTeam(data: ICreateTeamData): Promise<ITeam> {
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
    const formData = new FormData();
    if (data.name) {
      formData.append('team[name]', data.name);
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
    return response.data;
  }

  async deleteTeam(id: number): Promise<void> {
    await api.delete(`/teams/${id}`);
  }

  // Team Member operations
  async getTeamMembers(teamId: number) {
    try {
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
      const response = await api.post(`/teams/${teamId}/switch`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get current team
  async getCurrentTeam() {
    try {
      const response = await api.get('/teams/current');
      return response.data;
    } catch (error) {
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
export const addTeamMember = (teamId: number, data: IInviteData) => teamService.addTeamMember(teamId, data);
export const updateTeamMember = (teamId: number, memberId: number, role: string) => teamService.updateTeamMember(teamId, memberId, role);
export const removeTeamMember = (teamId: number, memberId: number) => teamService.removeTeamMember(teamId, memberId);
export const switchTeam = (teamId: number) => teamService.switchTeam(teamId);
export const getCurrentTeam = () => teamService.getCurrentTeam();

export default teamService;