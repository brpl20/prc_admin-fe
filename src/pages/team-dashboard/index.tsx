import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import TeamDashboard from '@/components/TeamDashboard';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const TeamDashboardPage = () => {
  return (
    <>
      <Head>
        <title>Dashboard do Time - ProcStudio</title>
      </Head>
      <Layout>
        <TeamDashboard />
      </Layout>
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

export default TeamDashboardPage;