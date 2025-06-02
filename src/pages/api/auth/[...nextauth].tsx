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

          const user = await res.json();

          return {
            id: user.token,
            email: credentials.email,
            ...user,
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    jwt: ({ token, user }) => {
      return user ? { ...token, user } : token;
    },
    session: ({ session, token }: any) => {
      if (token?.user) {
        return token.user;
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/login',
  },
};

export default NextAuth(authOptions);
