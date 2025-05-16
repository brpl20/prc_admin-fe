import api from './api';
import { ILogin, ILoginResponse } from '@/interfaces/IAuth';

export const login = async (credentials: ILogin): Promise<ILoginResponse> => {
  const response = await api.post('/login', {
    auth: credentials,
  });
  return response.data;
};

export const logout = async () => {
  const response = await api.delete('/logout');
  return response.data;
};
