/**
 * Team validation utilities
 * Logic for determining team setup status and requirements
 */

import { ITeam } from '@/interfaces/ITeam';

/**
 * Checks if a team is still a mock team created by the system
 * If updated_at == created_at (or very close), it means user hasn't modified it
 * @param team - Team object with created_at and updated_at timestamps
 * @returns boolean indicating if team needs user configuration
 */
export const isTeamMockOrUnconfigured = (team: ITeam): boolean => {
  if (!team.created_at || !team.updated_at) {
    // If timestamps are missing, assume it needs configuration
    return true;
  }

  const createdAt = new Date(team.created_at);
  const updatedAt = new Date(team.updated_at);
  
  // If updated_at is the same as created_at (within 1 second tolerance for DB timing)
  // then user hasn't configured the team yet
  const timeDifference = Math.abs(updatedAt.getTime() - createdAt.getTime());
  const isUnconfigured = timeDifference <= 1000; // 1 second tolerance

  return isUnconfigured;
};

/**
 * Checks if team needs setup based on multiple criteria:
 * 1. If it's a mock team (created_at == updated_at)
 * 2. If it has default/generic name pattern
 * 3. If it's missing key configuration (subdomain, etc.)
 * @param team - Team object
 * @returns boolean indicating if team setup modal should be shown
 */
export const doesTeamNeedSetup = (team: ITeam): boolean => {
  // Check if it's a mock team
  if (isTeamMockOrUnconfigured(team)) {
    return true;
  }

  // Check for generic/default names that indicate mock team
  const genericNamePatterns = [
    /^Team\s+/i,           // "Team Something"
    /^Mock\s+/i,           // "Mock Something"  
    /^Default\s+/i,        // "Default Something"
    /^Untitled/i,          // "Untitled"
    /^New\s+Team/i,        // "New Team"
  ];

  const hasGenericName = genericNamePatterns.some(pattern => pattern.test(team.name));
  if (hasGenericName) {
    return true;
  }

  // Check if missing critical configuration
  if (!team.subdomain || team.subdomain.trim() === '') {
    return true;
  }

  return false; // Team appears to be properly configured
};

/**
 * Gets a user-friendly message explaining why team setup is needed
 * @param team - Team object
 * @returns string message for UI display
 */
export const getTeamSetupReason = (team: ITeam): string => {
  if (isTeamMockOrUnconfigured(team)) {
    return 'Este time foi criado automaticamente durante o registro. Vamos configurá-lo com suas informações.';
  }

  if (!team.subdomain) {
    return 'Seu time precisa de um subdomínio para funcionar corretamente.';
  }

  return 'Vamos finalizar a configuração do seu time jurídico.';
};