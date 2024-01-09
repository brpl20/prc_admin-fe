import React, { useEffect, useState, useContext } from 'react';
import Router, { useRouter } from 'next/router';
import { withAuth } from '@/middleware/withAuth';

import { PageTitleContext } from '@/contexts/PageTitleContext';

import Link from 'next/link';

import {
  colors,
  PageTitle,
  Input,
  Flex,
  CloseDropdown,
  ContentContainer,
  Container,
  SelectContainer,
} from '@/styles/globals';

import { Footer } from '@/components';
import dynamic from 'next/dynamic';
import DetailsC from '@/components/Details';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const Details = () => {
  const { showTitle } = useContext(PageTitleContext);

  const router = useRouter();
  const params = router.query.type ? router.query.type : '';

  return (
    <>
      <Layout>
        <Container>
          {params.includes('cliente') && (
            <h1
              style={{
                color: colors.primary,
                fontSize: '32px',
                fontWeight: '500',
                marginBottom: '32px',
              }}
            >
              Dados do Cliente
            </h1>
          )}
          <ContentContainer
            style={{
              borderRadius: '5px',
              padding: '0',
            }}
          >
            <DetailsC params={params} />
          </ContentContainer>
        </Container>
        <Footer />
      </Layout>
    </>
  );
};

export default withAuth(Details);
