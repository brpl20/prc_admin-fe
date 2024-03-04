'use client';

import React, { useEffect } from 'react';

import { Container } from '@/styles/globals';
import {} from 'react-icons/md';

import { Footer } from '@/components';
import { Box, Typography } from '@mui/material';

import dynamic from 'next/dynamic';
import { getSession } from 'next-auth/react';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const Home = () => {
  useEffect(() => {}, []);

  return (
    <>
      <Layout>
        <Container>
          <Box>
            <Typography variant="h6" component="div">
              {'<Development />'}
            </Typography>
          </Box>
        </Container>
        {/* <Footer /> */}
      </Layout>
    </>
  );
};

export default Home;

export const getServerSideProps = async (ctx: any) => {
  return {
    redirect: {
      destination: '/clientes',
      permanent: false,
    },
  };
};
