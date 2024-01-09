'use client';

import React, { useEffect } from 'react';
import { withAuth } from '@/middleware/withAuth';

import { Container } from '@/styles/globals';
import {} from 'react-icons/md';

import { Footer } from '@/components';
import { Box, Typography } from '@mui/material';

import dynamic from 'next/dynamic';
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

export default withAuth(Home);
