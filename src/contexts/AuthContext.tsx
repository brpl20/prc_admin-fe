import { createContext, useState, useEffect } from 'react';
import { setCookie, destroyCookie, parseCookies } from 'nookies';
import { useSession } from 'next-auth/react';
import jwt from 'jsonwebtoken';

import {
  signInRequest,
  loginWithGoogle,
  logoutRequest,
} from '../services/auth';
import { api } from '@/services/api';
import Router from 'next/router';

import { IAuthContextType, IUser, ISignInData } from '@/interfaces/IAuth';

export const AuthContext = createContext({} as IAuthContextType);

export function AuthProvider({ children }: any) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<IUser>({} as IUser);

  const isAuthenticated = !!user;

  const saveToken = (token: string) => {
    const decodedToken = jwt.decode(token) as any;
    const { admin_id } = decodedToken;

    setCookie(undefined, 'nextauth.token', token, {
      maxAge: 60 * 60 * 1,
      // 1 hour duration
    });

    setCookie(undefined, 'admin_id', admin_id);
    setCookie(undefined, 'nextauth.isAuth', 'true');
    api.defaults.headers['Authorization'] = `Bearer ${token}`;
    Router.push('/home');
  };

  async function localAuthentication({ email, password }: ISignInData) {
    try {
      const { token } = await signInRequest({
        email,
        password,
      });

      saveToken(token);
    } catch (error: any) {
      throw error;
    }
  }

  const handleGoogleLogin = async (session: Object) => {
    try {
      const response = await loginWithGoogle(session);
      saveToken(response.token);
    } catch (error: any) {}
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

  useEffect(() => {
    const { ['nextauth.isAuth']: authenticate } = parseCookies();
    if (session && status === 'authenticated' && !authenticate) {
      handleGoogleLogin(session);
    }
  }, [session, status]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, localAuthentication, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
