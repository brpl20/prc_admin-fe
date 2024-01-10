import React, { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/middleware/withAuth';

import { PageTitleContext } from '@/contexts/PageTitleContext';

import { colors, ContentContainer, Container } from '@/styles/globals';

import { Footer } from '@/components';
import dynamic from 'next/dynamic';
import DetailsC from '@/components/Details';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const Details = () => {
  const { setShowTitle, setPageTitle } = useContext(PageTitleContext);

  const router = useRouter();
  const params = router.query.type ? router.query.type : '';

  useEffect(() => {
    const updateScrollPosition = () => {
      if (window.scrollY >= 49) {
        setShowTitle(true);
        setPageTitle(
          params.includes('cliente')
            ? 'Dados do Cliente'
            : params.includes('escritorio')
            ? 'Descrição do Escritório'
            : 'Descrição do Usuário',
        );
      } else if (window.scrollY <= 32) {
        setShowTitle(false);
        setPageTitle('');
      }
    };

    window.addEventListener('scroll', updateScrollPosition);

    return () => {
      window.removeEventListener('scroll', updateScrollPosition);
    };
  }, []);

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
                marginBottom: '20px',
              }}
            >
              Dados do Cliente
            </h1>
          )}

          {params.includes('escritorio') && (
            <h1
              style={{
                color: colors.primary,
                fontSize: '32px',
                fontWeight: '500',
                marginBottom: '20px',
              }}
            >
              Descrição do Escritório
            </h1>
          )}

          {params.includes('usuario') && (
            <h1
              style={{
                color: colors.primary,
                fontSize: '32px',
                fontWeight: '500',
                marginBottom: '20px',
              }}
            >
              Descrição do Usuário
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
