import { createContext, useCallback, useState, useEffect } from 'react';
import { setCookie, destroyCookie } from 'nookies';
import jwt from 'jsonwebtoken';
import { logoutRequest } from '../services/auth';
import { IAuthContextType, IUser } from '@/interfaces/IAuth';
import { IAdminPropsAttributes } from '@/interfaces/IAdmin';
import { getProfileAdminById } from '@/services/admins';

export const AuthContext = createContext({} as IAuthContextType);

const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<IUser>({} as IUser);
  const [userData, setUserData] = useState<IAdminPropsAttributes | null>(null);
  const isAuthenticated = !!user;

  const fetchUserData = useCallback(async (adminId: string) => {
    try {
      const data: IAdminPropsAttributes = (await getProfileAdminById(adminId)).data.data.attributes;
      setUserData(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return null;
    }
  }, []);

  // Automatically fetch user data when user changes
  useEffect(() => {
    if (user.admin_id) {
      fetchUserData(user.admin_id);
    }
  }, [user, fetchUserData]);

  const saveToken = async (token: string) => {
    const decodedToken = jwt.decode(token) as any;
    const { admin_id } = decodedToken;
    setCookie(undefined, 'nextauth.token', token, {
      maxAge: 60 * 60 * 1, // 1 hour duration
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
      setUserData(null);
    } catch (error: any) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        isAuthenticated,
        handleLogout,
        saveToken,
        fetchUserData, // IMPORTANT: for manual refreshes
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
