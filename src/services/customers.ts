import { ICustomer, IProfileCustomer } from '@/interfaces/ICustomer';
import api from './api';
import { CustomersProps } from '@/pages/clientes';

const createProfileCustomer = async (data: any) => {
  try {
    const response = await api.post('/profile_customers', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateProfileCustomer = async (id: string, data: any) => {
  try {
    const response = await api.put(`/profile_customers/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllProfileCustomer = async (typeOfParams: string) => {
  const url =
    typeOfParams !== '' ? `/profile_customers?deleted=${typeOfParams}` : '/profile_customers';

  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllCustomers = async (): Promise<{ data: ICustomer[] }> => {
  try {
    const response = await api.get('/customers');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getCustomerById = async (id: string, includeDeleted: boolean = false) => {
  const url = `/profile_customers/${id}${includeDeleted ? '?include_deleted=true' : ''}`;
  const response = await api.get(url);
  return response.data;
};

const inactiveCustomer = async (id: string) => {
  try {
    await api.delete(`/profile_customers/${id}`);
  } catch (error) {
    throw error;
  }
};

const deleteCustomer = async (id: string) => {
  try {
    await api.delete(`/customers/${id}`);
  } catch (error) {
    throw error;
  }
};

const deleteProfileCustomer = async (id: string) => {
  try {
    await api.delete(`/profile_customers/${id}?destroy_fully=true`);
  } catch (error) {
    throw error;
  }
};

const restoreProfileCustomer = async (id: string) => {
  try {
    await api.post(`/profile_customers/${id}/restore`);
  } catch (error) {
    throw error;
  }
};

export {
  createProfileCustomer,
  updateProfileCustomer,
  getAllCustomers,
  getAllProfileCustomer,
  getCustomerById,
  inactiveCustomer,
  deleteCustomer,
  deleteProfileCustomer,
  restoreProfileCustomer,
};
