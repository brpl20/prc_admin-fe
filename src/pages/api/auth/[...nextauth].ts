import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

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
          const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/login`, {
            method: 'POST',
            body: JSON.stringify({
              auth: {
                email: credentials.email,
                password: credentials.password,
              },
            }),
            headers: { 'Content-Type': 'application/json' },
          });

          if (!res.ok) throw new Error(await res.text());

          const { token, role } = await res.json();

          return {
            id: token,
            email: credentials.email,
            token,
            role,
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.token = user.token;
        token.role = user.role;
      }
      return token;
    },

    session: ({ session, token }: any) => {
      if (token) {
        session.token = token.token;
        session.role = token.role;
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
