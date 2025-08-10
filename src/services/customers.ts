import { ICustomer } from '@/interfaces/ICustomer';
import api from './api';
import teamService from './teams';

  const createProfileCustomer = async (data: any) => {
    try {
      // Buscar team_id automaticamente se não fornecido
      let teamId = data.profile_customer?.team_id;

      if (!teamId) {
        try {
          const teams = await teamService.listTeams();
          if (teams && teams.length > 0) {
            teamId = teams[0].id;
          }
        } catch (error) {
          console.warn('Não foi possível obter o team atual:', error);
        }
      }

      const payload = {
        ...data,
        profile_customer: {
          ...data.profile_customer,
          team_id: teamId,
        },
      };

      const response = await api.post('/profile_customers', payload);
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

const getAllProfileCustomer = async (typeOfParams: string) => {
  const url =
    typeOfParams !== '' ? `/profile_customers?deleted=${typeOfParams}` : '/profile_customers';

  try {
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    // Handle 401 errors specifically for first-time users
    if (error.response?.status === 401) {
      console.warn('Authentication error on getAllProfileCustomer - might be first-time user without ProfileAdmin');
      // Check if this is a first-time user issue
      try {
        const profileCheck = await api.get('/profile_admins/me');
        // If ProfileAdmin exists, re-throw original error
        throw error;
      } catch (profileError: any) {
        if (profileError.response?.status === 401 || profileError.response?.status === 404) {
          // ProfileAdmin doesn't exist - this is expected for first-time users
          const profileRequiredError = new Error('PROFILE_ADMIN_REQUIRED: User needs to complete profile setup before accessing customers');
          profileRequiredError.name = 'PROFILE_ADMIN_REQUIRED';
          throw profileRequiredError;
        }
        // Different error, re-throw original
        throw error;
      }
    }
    throw error;
  }
};

const getAllCustomers = async (): Promise<{ data: ICustomer[] }> => {
  try {
    const response = await api.get('/customers');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getCustomerById = async (id: string, includeDeleted: boolean = false) => {
  const url = `/profile_customers/${id}${includeDeleted ? '?include_deleted=true' : ''}`;
  const response = await api.get(url);
  return response.data;
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
  updateProfileCustomer,
  getAllCustomers,
  getAllProfileCustomer,
  getCustomerById,
  inactiveCustomer,
  deleteCustomer,
  deleteProfileCustomer,
  restoreProfileCustomer,
};
