import api from './api';

const createTask = async (data: any) => {
  const payload = {
    job: data,
  };

  try {
    const response = await api.post('/jobs', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllTasks = async (typeOfParams: string) => {
  const url = typeOfParams !== '' ? `/jobs?deleted=${typeOfParams}` : '/jobs';

  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getTaskById = async (id: string) => {
  try {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateTask = async (id: string, data: any) => {
  const payload = {
    job: data,
  };

  try {
    const response = await api.put(`/jobs/${id}`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const inactiveJob = async (id: string) => {
  try {
    await api.delete(`/jobs/${id}`);
  } catch (error) {
    throw error;
  }
};

const deleteJob = async (id: string) => {
  try {
    await api.delete(`/jobs/${id}?destroy_fully=true`);
  } catch (error) {
    throw error;
  }
};

const restoreJob = async (id: string) => {
  try {
    await api.post(`/jobs/${id}/restore`);
  } catch (error) {
    throw error;
  }
};

export { createTask, getAllTasks, getTaskById, updateTask, inactiveJob, deleteJob, restoreJob };
