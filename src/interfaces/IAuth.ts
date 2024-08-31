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
  handleLogout: () => void;
  saveToken: (token: string) => void;
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
