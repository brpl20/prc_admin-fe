import { IJwtPayload } from '@/interfaces/IAuth';
import authService from '@/services/auth';
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        try {
          const { token, role } = await authService.login(credentials);
          const { admin_id: userId } = jwt.decode(token) as IJwtPayload;
          if (!userId) throw new Error(`Invalid token`);

          return {
            id: userId,
            email: credentials.email,
            token,
            role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.token = user.token;
        token.role = user.role;

        try {
          const adminData = await authService.getAdminById(user.id, user.token);
          const profileAdminId = adminData.data.relationships.profile_admin.data.id;
          const profileData = await authService.getProfileAdminById(profileAdminId, user.token);

          token.admin = adminData.data;
          token.profile = profileData.data;
        } catch (error) {
          console.error('Failed to fetch user data by JWT:', error);
        }
      }
      return token;
    },

    session: ({ session, token }) => {
      if (token.token) {
        session.token = token.token;
        session.role = token.role;
        session.user = {
          ...session.user,
          id: token.admin?.id || token.sub || '',
          admin: token.admin,
          profile: token.profile,
        };
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
};

export default NextAuth(authOptions);
