import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInRequest } from '@/services/auth';

interface GoogleProviderConfig {
  clientId: string;
  clientSecret: string;
}

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials.password) return null;

        const user = await signInRequest({
          email: credentials.email,
          password: credentials.password,
        });

        if (user) {
          return user;
        } else {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    } as GoogleProviderConfig),
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
    signIn: ({ account, profile }) => {
      if (account?.provider === 'google') {
        return profile?.email ? true : false;
      }

      return true;
    },
  },
  session: {
    maxAge: 60 * 60 * 24, // 24 hours
  },
});
