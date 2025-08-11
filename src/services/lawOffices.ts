import api from './api';

const createLawOffice = async (data: any) => {
  try {
    const response = await api.post('/legal_entity_offices', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getLawOfficeById = async (id: string) => {
  try {
    const response = await api.get(`/legal_entity_offices/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateLawOffice = async (id: string, data: any) => {
  try {
    const response = await api.put(`/legal_entity_offices/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteLawOffice = async (id: string) => {
  try {
    await api.delete(`/legal_entity_offices/${id}`);
  } catch (error) {
    throw error;
  }
};

// Partnership management
const createPartnership = async (officeId: string, partnershipData: any) => {
  try {
    const response = await api.post(`/legal_entity_offices/${officeId}/partnerships`, {
      partnership: partnershipData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updatePartnership = async (officeId: string, partnershipId: string, partnershipData: any) => {
  try {
    const response = await api.put(`/legal_entity_offices/${officeId}/partnerships/${partnershipId}`, {
      partnership: partnershipData
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deletePartnership = async (officeId: string, partnershipId: string) => {
  try {
    await api.delete(`/legal_entity_offices/${officeId}/partnerships/${partnershipId}`);
  } catch (error) {
    throw error;
  }
};

export {
  createLawOffice,
  getLawOfficeById,
  updateLawOffice,
  deleteLawOffice,
  createPartnership,
  updatePartnership,
  deletePartnership,
};