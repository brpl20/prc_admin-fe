/**
 * Authentication validation utilities
 * Centralized logic for validating session and authentication state
 */

import { Session } from 'next-auth';

/**
 * Validates if a session is properly authenticated
 * @param session - NextAuth session object (returns user object directly from session callback)
 * @returns boolean indicating if session is valid for API calls
 */
export const isSessionAuthenticated = (session: Session | null | undefined): boolean => {
  if (!session) return false;

  // NextAuth session callback returns the entire user object as session
  // Properties are accessed directly on session (id, email, name, token, etc.)
  const hasToken = Boolean(session.id && 
                           typeof session.id === 'string' && 
                           session.id.trim() !== '' &&
                           session.id !== 'undefined');

  const hasEmail = Boolean(session.email &&
                           typeof session.email === 'string' &&
                           session.email.trim() !== '');

  return hasToken && hasEmail;
};

/**
 * Validates if a session is ready (not loading and has basic structure)
 * @param session - NextAuth session object
 * @param status - NextAuth status ('authenticated' | 'unauthenticated' | 'loading')
 * @returns boolean indicating if session is ready for evaluation
 */
export const isSessionReady = (
  session: Session | null | undefined, 
  status?: 'authenticated' | 'unauthenticated' | 'loading'
): boolean => {
  if (status === 'loading') return false;
  return session !== undefined;
};

/**
 * Get authentication error message based on session state
 * @param session - NextAuth session object (returns user object directly from session callback)
 * @returns error message or null if authenticated
 */
export const getAuthError = (session: Session | null | undefined): string | null => {
  if (!session) return 'No session found';
  if (!session.id) return 'No authentication token';
  if (!session.email) return 'No user email found';
  if (typeof session.id !== 'string' || session.id.trim() === '') return 'Invalid token format';
  if (typeof session.email !== 'string' || session.email.trim() === '') return 'Invalid email format';
  
  return null; // No errors, session is valid
};