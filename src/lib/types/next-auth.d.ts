// types/next-auth.d.ts
import { IAdmin, IProfileAdmin } from '@/interfaces/IAdmin';
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth/jwt' {
  interface JWT {
    token: string;
    role?: string;
    admin?: IAdmin;
    profile?: IProfileAdmin;
  }
}

declare module 'next-auth' {
  interface User extends DefaultUser {
    token: string;
    role: string;
    admin?: IAdmin;
    profile?: IProfileAdmin;
  }

  interface Session extends DefaultSession {
    token: string;
    role?: string;
    user: {
      id: string;
      admin?: IAdmin;
      profile?: IProfileAdmin;
    } & DefaultSession['user'];
  }
}
