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

const createCustomer = async (data: any) => {
  try {
    const response = await api.post('/customers', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateCustomer = async (data: CustomersProps) => {
  const payload = {
    customer: {
      email: data.email,
    },
  };

  try {
    await api.put(`/customers/${data.id}`, payload);
  } catch (error: any) {
    throw error.response.data.errors;
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

const getAllCustomers = async () => {
  try {
    const response = await api.get('/customers');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getCustomerById = async (id: string) => {
  try {
    const response = await api.get(`/profile_customers/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
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
  updateCustomer,
  updateProfileCustomer,
  createCustomer,
  getAllCustomers,
  getAllProfileCustomer,
  getCustomerById,
  inactiveCustomer,
  deleteCustomer,
  deleteProfileCustomer,
  restoreProfileCustomer,
};
