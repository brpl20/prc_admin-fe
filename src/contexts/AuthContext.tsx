import { createContext, useCallback, useState, useEffect } from 'react';
import { setCookie, destroyCookie } from 'nookies';
import jwt from 'jsonwebtoken';
import { logoutRequest } from '../services/auth';
import { IAuthContextType, IUser } from '@/interfaces/IAuth';
import { IProfileAdminAttributes } from '@/interfaces/IAdmin';
import { getProfileAdminById } from '@/services/admins';

export const AuthContext = createContext({} as IAuthContextType);

const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<IUser>({} as IUser);
  const [userProfile, setUserProfile] = useState<IProfileAdminAttributes | null>(null);
  const isAuthenticated = !!user;

  const fetchUserProfile = useCallback(async (profileAdminId: string) => {
    try {
      const data: IProfileAdminAttributes = (await getProfileAdminById(profileAdminId)).data.data
        .attributes;
      setUserProfile(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return null;
    }
  }, []);

  // Automatically fetch user data when user changes
  useEffect(() => {
    if (user.admin_id) {
      fetchUserProfile(user.admin_id);
    }
  }, [user, fetchUserProfile]);

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
      setUserProfile(null);
    } catch (error: any) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAuthenticated,
        handleLogout,
        saveToken,
        fetchUserProfile, // IMPORTANT: for manual refreshes
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
