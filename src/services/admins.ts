import { IAdminResponse, IProfileAdmin } from '@/interfaces/IAdmin';
import api from './api';

export const createProfileAdmin = async (data: any) => {
  try {
    const response = await api.post('/profile_admins', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAdmin = async (id: string, data: any) => {
  try {
    const response = await api.put(`/admins/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllProfileAdmins = async (typeOfParams: string) => {
  const url = typeOfParams !== '' ? `/profile_admins?deleted=${typeOfParams}` : '/profile_admins';

  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProfileAdminById = async (id: string): Promise<{ data: IProfileAdmin }> => {
  const response = await api.get(`/profile_admins/${id}`);
  return response.data;
};

export const getAdmins = async () => {
  try {
    const response = await api.get(`/admins`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAdminById = async (id: string): Promise<IAdminResponse> => {
  const response = await api.get(`/admins/${id}`);
  return response.data;
};

export const updateProfileAdmin = async (id: string, data: any) => {
  try {
    const response = await api.put(`/profile_admins/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const inactiveProfileAdmin = async (id: string) => {
  try {
    await api.delete(`/profile_admins/${id}`);
  } catch (error) {
    throw error;
  }
};

export const deleteProfileAdmin = async (id: string) => {
  try {
    await api.delete(`/profile_admins/${id}?destroy_fully=true`);
  } catch (error) {
    throw error;
  }
};

export const restoreProfileAdmin = async (id: string) => {
  try {
    await api.post(`/profile_admins/${id}/restore`);
  } catch (error) {
    throw error;
  }
};
