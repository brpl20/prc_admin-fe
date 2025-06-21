import NextAuth from 'next-auth/next';

declare module 'next-auth' {
  interface Session {
    id: string;
    email: string;
    name: string;
    last_name: string;
    token: string;
    token: string;
    role: string;
  }
}
