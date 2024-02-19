import api from './api';

const createOffice = async (data: any) => {
  try {
    const response = await api.post('/offices', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllOffices = async () => {
  try {
    const response = await api.get('/offices');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateOffice = async (id: string, data: any) => {
  try {
    const response = await api.put(`/offices/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getOfficeById = async (id: string) => {
  try {
    const response = await api.get(`/offices/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getOfficesWithLaws = async () => {
  try {
    const response = await api.get('/offices/with_lawyers');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllOfficeTypes = async () => {
  try {
    const response = await api.get('/office_types');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createOfficeType = async (data: any) => {
  try {
    const response = await api.post('/office_types', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export {
  createOffice,
  getAllOffices,
  updateOffice,
  getOfficeById,
  getOfficesWithLaws,
  getAllOfficeTypes,
  createOfficeType,
};
