import React from 'react';
import Head from 'next/head';
import TeamSetup from '@/components/TeamSetup';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

const TeamSetupPage = () => {
  return (
    <>
      <Head>
        <title>Configuração do Time - ProcStudio</title>
      </Head>
      <TeamSetup />
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

export default TeamSetupPage;