import { IAdminResponse, IProfileAdmin } from '@/interfaces/IAdmin';
import { ILogin, ILoginResponse } from '@/interfaces/IAuth';
import { serverApi } from '@/services/api';

const authService = {
  async login(credentials: ILogin): Promise<ILoginResponse> {
    const response = await serverApi.post('/login', {
      auth: credentials,
    });
    return response.data;
  },

  async logout() {
    const response = await serverApi.delete('/logout');
    return response.data;
  },

  async getAdminById(id: string, token: string): Promise<IAdminResponse> {
    const config = token
      ? {
          headers: { Authorization: `Bearer ${token}` },
        }
      : {};

    const response = await serverApi.get(`/admins/${id}`, config);
    return response.data;
  },

  async getProfileAdminById(id: string, token: string): Promise<{ data: IProfileAdmin }> {
    const config = token
      ? {
          headers: { Authorization: `Bearer ${token}` },
        }
      : {};

    const response = await serverApi.get(`/profile_admins/${id}`, config);
    return response.data;
  },
};

export default authService;
