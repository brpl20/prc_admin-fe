import { decode } from 'jsonwebtoken';
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

interface User {
  id: string;
  email: string;
  name: string;
  last_name: string;
  token: string;
  teams?: any[];
  current_team?: any;
  team_role?: string;
}

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

          const decoded = decode(user.token) as any | null;
          if (!decoded) {
            throw new Error('Token inválido');
          }

          return {
            id: user.token,
            email: credentials.email,
            name: decoded.name || decoded.email,
            last_name: decoded.last_name || '',
            teams: user.teams || [],
            current_team: user.current_team,
            team_role: user.team_role,
            needs_profile_setup: user.needs_profile_setup,
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
    async redirect({ url, baseUrl }) {
      // Always redirect to team-check after login to avoid API verification issues
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/team-check`;
      }
      
      // Parse URL to check exact path
      try {
        const parsedUrl = new URL(url, baseUrl);
        const pathname = parsedUrl.pathname;
        
        // If already on team-check or team-setup, stay there
        if (pathname === '/team-check' || pathname === '/team-setup') {
          return url;
        }
        
        // If trying to go to login/register, allow it
        if (pathname === '/login' || pathname === '/register') {
          return url;
        }
        
        // For any other authenticated route, redirect to team-check first
        return `${baseUrl}/team-check`;
      } catch (error) {
        // If URL parsing fails, default to team-check
        console.warn('Failed to parse redirect URL:', url);
        return `${baseUrl}/team-check`;
      }
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
