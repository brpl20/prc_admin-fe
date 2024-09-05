import { createContext, useState } from 'react';
import { setCookie, destroyCookie } from 'nookies';
import jwt from 'jsonwebtoken';

import { signInRequest, logoutRequest } from '../services/auth';
import Router from 'next/router';

import { IAuthContextType, IUser } from '@/interfaces/IAuth';
import api from '@/services/api';

export const AuthContext = createContext({} as IAuthContextType);

const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<IUser>({} as IUser);
  const isAuthenticated = !!user;

  const saveToken = (token: string) => {
    const decodedToken = jwt.decode(token) as any;
    const { admin_id } = decodedToken;
    setCookie(undefined, 'nextauth.token', token, {
      maxAge: 60 * 60 * 1,
      // 1 hour duration
    });

    setUser({ admin_id } as IUser);
    setCookie(undefined, 'admin_id', admin_id);
    setCookie(undefined, 'nextauth.isAuth', 'true');
  };

  const handleLogout = async () => {
    try {
      await logoutRequest();
      destroyCookie(undefined, 'nextauth.token');
      destroyCookie(undefined, 'nextauth.isAuth');
      destroyCookie(undefined, 'admin_id');
      setUser({} as IUser);
    } catch (error: any) {}
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, handleLogout, saveToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
