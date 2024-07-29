import api from './api';

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

const updateCustomer = async (id: string, data: any) => {
  try {
    const response = await api.put(`/customers/${id}`, data);
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

const getAllProfileCustomer = async () => {
  try {
    const response = await api.get('/profile_customers');
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

export {
  createProfileCustomer,
  updateCustomer,
  updateProfileCustomer,
  createCustomer,
  getAllCustomers,
  getAllProfileCustomer,
  getCustomerById,
};
