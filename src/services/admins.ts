import { IAdminResponse, IProfileAdmin } from '@/interfaces/IAdmin';
import api from './api';

const createProfileAdmin = async (data: any) => {
  try {
    const response = await api.post('/profile_admins', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateAdmin = async (id: string, data: any) => {
  try {
    const response = await api.put(`/admins/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllProfileAdmins = async (typeOfParams: string) => {
  const url = typeOfParams !== '' ? `/profile_admins?deleted=${typeOfParams}` : '/profile_admins';

  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getProfileAdminById = async (id: string): Promise<IProfileAdmin> => {
  try {
    const response = await api.get(`/profile_admins/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

const getAdmins = async () => {
  try {
    const response = await api.get(`/admins`);
    return response;
  } catch (error) {
    throw error;
  }
};

const getAdminById = async (id: string): Promise<IAdminResponse> => {
  const response = await api.get(`/admins/${id}`);
  return response.data;
};

const updateProfileAdmin = async (id: string, data: any) => {
  try {
    const response = await api.put(`/profile_admins/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const inactiveProfileAdmin = async (id: string) => {
  try {
    await api.delete(`/profile_admins/${id}`);
  } catch (error) {
    throw error;
  }
};

const deleteProfileAdmin = async (id: string) => {
  try {
    await api.delete(`/profile_admins/${id}?destroy_fully=true`);
  } catch (error) {
    throw error;
  }
};

const restoreProfileAdmin = async (id: string) => {
  try {
    await api.post(`/profile_admins/${id}/restore`);
  } catch (error) {
    throw error;
  }
};

export {
  createProfileAdmin,
  getAllProfileAdmins,
  getProfileAdminById,
  getAdmins,
  getAdminById,
  updateAdmin,
  updateProfileAdmin,
  inactiveProfileAdmin,
  deleteProfileAdmin,
  restoreProfileAdmin,
};
