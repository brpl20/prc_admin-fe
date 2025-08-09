import api from './api';
import teamService from './teams';

const createWork = async (data: any) => {
  // Obter o team atual do usuário
  let teamId = null;
  try {
    const teams = await teamService.listTeams();
    if (teams && teams.length > 0) {
      teamId = teams[0].id;
    }
  } catch (error) {
    console.warn('Não foi possível obter o team atual:', error);
  }

  const payload = {
    work: {
      ...data,
      team_id: teamId, // Adicionar team_id ao payload
    },
  };

  const response = await api.post('/works', payload);
  return response.data;
};

const getAllWorks = async (typeOfParams: string) => {
  const url = typeOfParams !== '' ? `/works?deleted=${typeOfParams}` : '/works';
  const response = await api.get(url);
  return response.data;
};

const getWorkById = async (id: string) => {
  const response = await api.get(`/works/${id}`);
  return response.data;
};

const getWorkByCustomerId = async (id: string) => {
  const response = await api.get(`/works?customer_id=${id}`);
  return response.data;
};

const updateWork = async (id: string, data: any) => {
  const response = await api.put(`/works/${id}`, data);
  return response.data;
};

const createDraftWork = async (data: any) => {
  const response = await api.post('/draft/works', data);
  return response.data;
};

const getAllDraftWorks = async () => {
  const response = await api.get('/draft/works');
  return response.data;
};

const inactiveWork = async (id: string) => {
  await api.delete(`/works/${id}`);
};

const deleteWork = async (id: string) => {
  await api.delete(`/works/${id}?destroy_fully=true`);
};

const restoreWork = async (id: string) => {
  await api.post(`/works/${id}/restore`);
};

const uploadDocumentForRevision = async (workId: number, documentId: number, file: File) => {
  const data = new FormData();
  data.append('file', file);

  const response = await api.patch(`/works/${workId}/documents/${documentId}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const uploadSignedDocument = async (workId: number, documentId: number, file: File) => {
  const data = new FormData();
  data.append('file', file);
  data.append('is_signed_pdf', 'true');

  const response = await api.patch(`/works/${workId}/documents/${documentId}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

const convertDocumentsToPdf = async (workId: number, documents: number[]) => {
  const response = await api.post(`/works/${workId}/convert_documents_to_pdf`, {
    approved_documents: documents,
  });
  return response.data;
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
  uploadDocumentForRevision,
  uploadSignedDocument,
  convertDocumentsToPdf,
};
