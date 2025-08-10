import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const response = req.nextauth?.token ? NextResponse.next() : NextResponse.redirect(new URL('/', req.url));
    
    // Add performance headers
    response.headers.set('X-Render-Start', Date.now().toString());
    
    // Add security headers for better performance
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // Add cache headers for better performance
    if (req.nextUrl.pathname.startsWith('/_next/static/') || 
        req.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    return response;
  },
  {
    callbacks: {
      authorized: params => {
        const { token } = params;
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    '/home', 
    '/clientes', 
    '/trabalhos', 
    '/documentos', 
    '/escritorios', 
    '/tarefas',
    '/usuarios',
    '/detalhes',
    '/alterar',
    '/cadastrar',
    '/wiki'
  ],
};
