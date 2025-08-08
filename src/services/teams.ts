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

class TeamService {
  async listTeams(): Promise<ITeam[]> {
    const response = await api.get('/api/v1/teams');
    return response.data;
  }

  async getTeam(id: number): Promise<ITeam> {
    const response = await api.get(`/api/v1/teams/${id}`);
    return response.data;
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

    const response = await api.post('/api/v1/teams', formData, {
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

    const response = await api.patch(`/api/v1/teams/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteTeam(id: number): Promise<void> {
    await api.delete(`/api/v1/teams/${id}`);
  }

  async addTeamMember(teamId: number, invite: ITeamInvite): Promise<ITeamMember> {
    const response = await api.post(`/api/v1/teams/${teamId}/add_member`, {
      member: invite,
    });
    return response.data;
  }

  async removeTeamMember(teamId: number, memberId: number): Promise<void> {
    await api.delete(`/api/v1/teams/${teamId}/members/${memberId}`);
  }

  async updateMemberRole(
    teamId: number,
    memberId: number,
    role: ITeamMember['role']
  ): Promise<ITeamMember> {
    const response = await api.patch(`/api/v1/teams/${teamId}/members/${memberId}`, {
      member: { role },
    });
    return response.data;
  }

  async getSubscription(teamId: number): Promise<ISubscription> {
    const response = await api.get(`/api/v1/subscriptions/${teamId}`);
    return response.data;
  }

  async createSubscription(planId: number): Promise<ISubscription> {
    const response = await api.post('/api/v1/subscriptions', {
      subscription: {
        subscription_plan_id: planId,
      },
    });
    return response.data;
  }

  async updateSubscription(id: number, status: ISubscription['status']): Promise<ISubscription> {
    const response = await api.patch(`/api/v1/subscriptions/${id}`, {
      subscription: { status },
    });
    return response.data;
  }

  async cancelSubscription(id: number): Promise<ISubscription> {
    const response = await api.patch(`/api/v1/subscriptions/${id}/cancel`);
    return response.data;
  }

  async getSubscriptionPlans(): Promise<ISubscriptionPlan[]> {
    const response = await api.get('/api/v1/subscriptions/plans');
    return response.data;
  }

  async getUsageStatistics(teamId: number): Promise<ISubscription['usage']> {
    const response = await api.get('/api/v1/subscriptions/usage');
    return response.data;
  }
}

export default new TeamService();