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

const getAllWorks = async (typeOfParams: string) => {
  const url = typeOfParams !== '' ? `/works?deleted=${typeOfParams}` : '/works';

  try {
    const response = await api.get(url);
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

const inactiveWork = async (id: string) => {
  try {
    await api.delete(`/works/${id}`);
  } catch (error) {
    throw error;
  }
};

const deleteWork = async (id: string) => {
  try {
    await api.delete(`/works/${id}?destroy_fully=true`);
  } catch (error) {
    throw error;
  }
};

const restoreWork = async (id: string) => {
  try {
    await api.post(`/works/${id}/restore`);
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
  inactiveWork,
  deleteWork,
  restoreWork,
};
