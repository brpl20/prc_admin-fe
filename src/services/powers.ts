import api from './api';

const getAllPowers = async () => {
  try {
    const response = await api.get('/powers');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getPowerById = async (id: string) => {
  try {
    const response = await api.get(`/powers/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { getAllPowers, getPowerById };
