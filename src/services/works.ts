import api from './api';

const createWork = async (data: any) => {
  const payload = {
    work: data,
  };

  try {
    const response = await api.post('/works', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllWorks = async () => {
  try {
    const response = await api.get('/works');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getWorkById = async (id: string) => {
  try {
    const response = await api.get(`/works/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getWorkByCustomerId = async (id: string) => {
  try {
    const response = await api.get(`/works?customer_id=${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateWork = async (id: string, data: any) => {
  const payload = {
    work: data,
    regenerate_documents: true,
  };

  try {
    const response = await api.put(`/works/${id}`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createDraftWork = async (data: any) => {
  try {
    const response = await api.post('/draft/works', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllDraftWorks = async () => {
  try {
    const response = await api.get('/draft/works');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export {
  createWork,
  getAllWorks,
  getWorkById,
  updateWork,
  createDraftWork,
  getAllDraftWorks,
  getWorkByCustomerId,
};
