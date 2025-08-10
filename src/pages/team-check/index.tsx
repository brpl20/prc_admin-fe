import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useOptimizedSession } from '@/hooks/useOptimizedSession';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import teamService from '@/services/teams';
import FirstTimeSetupModal from '@/components/Modals/FirstTimeSetup';
import ProfileSetupModal from '@/components/ProfileSetupModal';
import api from '@/services/api';
import { doesTeamNeedSetup, getTeamSetupReason } from '@/utils/teamValidation';

const TeamCheckPage = () => {
  const router = useRouter();
  const { data: session, isReady, isAuthenticated } = useOptimizedSession();
  const { measureApiCall } = usePerformanceMonitor('team-check');
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const checkUserSetup = useCallback(async () => {
    if (!session) return;

    try {
      // First, always check if ProfileAdmin exists (only API call we make)
      let hasProfileAdmin = false;
      try {
        await measureApiCall(() => api.get('/profile_admins/me'), 'profile-admin-check');
        hasProfileAdmin = true;
      } catch (error) {
        // ProfileAdmin doesn't exist, which is expected for new users
        hasProfileAdmin = false;
      }

      if (!hasProfileAdmin) {
        // No ProfileAdmin - show profile setup modal
        setShowProfileSetup(true);
        setLoading(false);
        return;
      }

      // ProfileAdmin exists, check if we have properly configured teams
      try {
        const teams = await measureApiCall(() => teamService.listTeams(), 'teams-list');
        
        if (!teams || teams.length === 0) {
          // No teams at all - show team setup
          setShowSetupModal(true);
          setLoading(false);
          return;
        }

        // Check if any team needs configuration (mock teams or incomplete setup)
        const teamNeedsSetup = teams.some(team => doesTeamNeedSetup(team));
        
        if (teamNeedsSetup) {
          // Team exists but needs user configuration
          console.log('Team needs setup - showing configuration modal');
          setShowSetupModal(true);
          setLoading(false);
        } else {
          // Team is properly configured - proceed to main application
          console.log('Team is properly configured - proceeding to main app');
          router.push('/clientes');
        }
      } catch (error) {
        console.error('Error checking teams:', error);
        // On error, assume team setup is needed
        setShowSetupModal(true);
        setLoading(false);
      }

    } catch (error) {
      console.error('Error in user setup check:', error);
      // On any error, show ProfileAdmin setup to be safe
      setShowProfileSetup(true);
      setLoading(false);
    }
  }, [session, router, measureApiCall]);

  useEffect(() => {
    if (isReady && isAuthenticated && !hasChecked) {
      checkUserSetup();
      setHasChecked(true);
    } else if (isReady && !isAuthenticated) {
      // Not authenticated, redirect to login
      router.push('/login');
    }
  }, [isReady, isAuthenticated, hasChecked, checkUserSetup, router]);


  const handleStartSetup = () => {
    router.push('/team-setup');
  };

  const handleSkipSetup = () => {
    // Only allow skipping to /clientes if ProfileAdmin exists
    router.push('/clientes');
  };

  const handleProfileSetupComplete = async () => {
    setShowProfileSetup(false);
    // Após criar o ProfileAdmin, forçar uma nova verificação que ignore a sessão atual
    setLoading(true);
    
    try {
      // Verificar diretamente se o ProfileAdmin foi criado
      const profileResponse = await api.get('/profile_admins/me');
      
      if (profileResponse?.data) {
        // ProfileAdmin criado com sucesso, verificar teams
        const teams = await teamService.listTeams();
        
        if (!teams || teams.length === 0) {
          // No teams - show team setup
          setShowSetupModal(true);
          setLoading(false);
        } else {
          // Check if existing teams need configuration
          const teamNeedsSetup = teams.some(team => doesTeamNeedSetup(team));
          
          if (teamNeedsSetup) {
            setShowSetupModal(true);
            setLoading(false);
          } else {
            // Teams are properly configured - proceed to main app
            router.push('/clientes');
          }
        }
      } else {
        // Se ainda não tem ProfileAdmin, mostrar o modal novamente
        setShowProfileSetup(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking profile setup:', error);
      setShowProfileSetup(true);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verificando configuração...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <ProfileSetupModal
        open={showProfileSetup}
        onComplete={handleProfileSetupComplete}
        oab=""
      />
      <FirstTimeSetupModal
        open={showSetupModal}
        onClose={handleSkipSetup}
        onStartSetup={handleStartSetup}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default TeamCheckPage;