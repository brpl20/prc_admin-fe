import api from './api';

export interface LegalEntityOfficeData {
  legal_entity_id: number;
  team_id: number;
  oab_id: string;
  inscription_number: string;
  society_link: string;
  legal_specialty: string;
  partnerships_attributes: Array<{
    lawyer_id: number;
    partnership_type: 'socio' | 'associado' | 'socio_de_servico';
    ownership_percentage: number;
  }>;
}

export const createLegalEntityOffice = async (data: LegalEntityOfficeData) => {
  const response = await api.post('/legal_entity_offices', {
    legal_entity_office: data
  });
  return response.data;
};

export const updateLegalEntityOffice = async (id: number, data: LegalEntityOfficeData) => {
  const response = await api.put(`/legal_entity_offices/${id}`, {
    legal_entity_office: data
  });
  return response.data;
};

export const getLegalEntityOffice = async (id: number) => {
  const response = await api.get(`/legal_entity_offices/${id}`);
  return response.data;
};

export const getAllLegalEntityOffices = async () => {
  const response = await api.get('/legal_entity_offices');
  return response.data;
};