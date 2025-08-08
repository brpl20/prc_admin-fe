import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { Box, CircularProgress, Typography } from '@mui/material';
import teamService from '@/services/teams';
import FirstTimeSetupModal from '@/components/Modals/FirstTimeSetup';

const TeamCheckPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);

  useEffect(() => {
    checkUserTeam();
  }, []);

  const checkUserTeam = async () => {
    try {
      const teams = await teamService.listTeams();
      
      if (teams && teams.length > 0) {
        router.push('/clientes');
      } else {
        setShowSetupModal(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking team:', error);
      setShowSetupModal(true);
      setLoading(false);
    }
  };

  const handleStartSetup = () => {
    router.push('/team-setup');
  };

  const handleSkipSetup = () => {
    router.push('/clientes');
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
    <FirstTimeSetupModal
      open={showSetupModal}
      onClose={handleSkipSetup}
      onStartSetup={handleStartSetup}
    />
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