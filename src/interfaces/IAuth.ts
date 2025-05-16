import { IAdmin, IProfileAdmin } from '@/interfaces/IAdmin';

export interface ILogin {
  email: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
  role: string;
}

export interface IAuthContext {
  userId: string | null;
  userData: IAdmin | null;
  userProfileData: IProfileAdmin | null;
  isAuthenticated: boolean;
  handleLogout: () => Promise<void>;
  saveToken: (token: string) => Promise<void>;
  fetchUserData: (adminI: string) => Promise<void>;
}

export interface IGoogleProps {
  provider: string;
  accessToken: string;
  expires: string;
  user: {
    email: string;
    image: string;
    name: string;
  };
}
