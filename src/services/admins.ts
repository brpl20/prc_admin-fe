import { api } from './api';

const createAdmin = async (data: any) => {
  try {
    const response = await api.post('/profile_admins', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateAdmin = async (id: string, data: any) => {
  try {
    const response = await api.put(`/profile_admins/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllAdmins = async () => {
  try {
    const response = await api.get('/profile_admins');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAdminByID = async (id: string) => {
  try {
    const response = await api.get(`/profile_admins/${id}`);
    return response;
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

export { createAdmin, getAllAdmins, getAdminByID, getAdmins, updateAdmin };
