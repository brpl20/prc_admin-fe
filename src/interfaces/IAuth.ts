import { IAdminPropsAttributes } from '@/interfaces/IAdmin';

interface IUser {
  admin_id: string;
  name?: string;
  email?: string;
}

interface ISignInData {
  email: string;
  password: string;
}

interface IAuthContextType {
  isAuthenticated: boolean;
  user: IUser;
  userData: IAdminPropsAttributes | null;
  handleLogout: () => void;
  saveToken: (token: string) => void;
  fetchUserData: (adminId: string) => Promise<IAdminPropsAttributes | null>;
}

interface ISignInRequestData {
  email: string;
  password: string;
}

interface IGoogleProps {
  provider: string;
  accessToken: string;
  expires: string;
  user: {
    email: string;
    image: string;
    name: string;
  };
}

export type { IUser, ISignInData, IAuthContextType, ISignInRequestData, IGoogleProps };
