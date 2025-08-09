import api from './api';

export interface ITeam {
  id: number;
  name: string;
  subdomain: string;
  status: string;
  settings?: any;
  main_admin_id: number;
  owner_admin_id: number;
  created_at: string;
  updated_at: string;
}

export interface ITeamMembership {
  id: number;
  team_id: number;
  admin_id: number;
  role: 'owner' | 'admin' | 'member';
  status: string;
  joined_at: string;
}

export interface ICreateTeamData {
  name: string;
  subdomain: string;
  settings?: any;
}

export interface IInviteData {
  email: string;
  role: 'admin' | 'member';
}

// Team CRUD operations
export const getTeams = async () => {
  try {
    const response = await api.get('/teams');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTeamById = async (id: number) => {
  try {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTeam = async (data: ICreateTeamData) => {
  try {
    const response = await api.post('/teams', { team: data });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTeam = async (id: number, data: Partial<ICreateTeamData>) => {
  try {
    const response = await api.put(`/teams/${id}`, { team: data });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTeam = async (id: number) => {
  try {
    await api.delete(`/teams/${id}`);
  } catch (error) {
    throw error;
  }
};

// Team Member operations
export const getTeamMembers = async (teamId: number) => {
  try {
    const response = await api.get(`/teams/${teamId}/members`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addTeamMember = async (teamId: number, data: IInviteData) => {
  try {
    const response = await api.post(`/teams/${teamId}/members`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTeamMember = async (teamId: number, memberId: number, role: string) => {
  try {
    const response = await api.put(`/teams/${teamId}/members/${memberId}`, { role });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeTeamMember = async (teamId: number, memberId: number) => {
  try {
    await api.delete(`/teams/${teamId}/members/${memberId}`);
  } catch (error) {
    throw error;
  }
};

// Team switching
export const switchTeam = async (teamId: number) => {
  try {
    const response = await api.post(`/teams/${teamId}/switch`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get current team
export const getCurrentTeam = async () => {
  try {
    const response = await api.get('/teams/current');
    return response.data;
  } catch (error) {
    throw error;
  }
};