import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import { Box, CircularProgress, Typography } from '@mui/material';
import teamService from '@/services/teams';
import FirstTimeSetupModal from '@/components/Modals/FirstTimeSetup';
import ProfileSetupModal from '@/components/ProfileSetupModal';
import api from '@/services/api';

const TeamCheckPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (session && !hasChecked) {
      checkUserSetup();
      setHasChecked(true);
    }
  }, [session?.token, hasChecked]); // Só re-executar quando o token mudar e não foi verificado ainda

  const checkUserSetup = async () => {
    if (!session) return;

    try {
      // Verificar se precisa de setup de perfil baseado na sessão
      if ((session as any).needs_profile_setup) {
        setShowProfileSetup(true);
        setLoading(false);
        return;
      }

      // Se não precisa de setup de perfil, verificar teams
      const teams = await teamService.listTeams();
      
      if (teams && teams.length > 0) {
        router.push('/clientes');
      } else {
        setShowSetupModal(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking user setup:', error);
      // Em caso de erro, assumir que precisa de setup de perfil
      setShowProfileSetup(true);
      setLoading(false);
    }
  };

  const handleStartSetup = () => {
    router.push('/team-setup');
  };

  const handleSkipSetup = () => {
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
        
        if (teams && teams.length > 0) {
          router.push('/clientes');
        } else {
          setShowSetupModal(true);
          setLoading(false);
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