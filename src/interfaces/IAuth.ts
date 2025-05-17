import { IAdmin, IProfileAdmin } from '@/interfaces/IAdmin';

export interface ILogin {
  email: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
  role: string;
}

export interface IJwtPayload {
  admin_id?: string;
}

export interface IUser {
  id: string;
  email: string;
  token: string;
  role: string;
  userData: IAdmin;
  userProfileData: IProfileAdmin;
}

export interface IToken {
  token?: string;
  role?: string;
  userData?: IAdmin;
  userProfileData?: IProfileAdmin;
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
