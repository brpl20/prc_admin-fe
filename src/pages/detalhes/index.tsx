import React, { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';

import { PageTitleContext } from '@/contexts/PageTitleContext';

import { colors, ContentContainer, Container } from '@/styles/globals';

import { Footer } from '@/components';
import dynamic from 'next/dynamic';
import DetailsC from '@/components/Details';
import { FiEdit } from 'react-icons/fi';
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
            : params.includes('trabalho')
            ? 'Informações sobre o Trabalho'
            : 'Descrição do Usuário',
        );
      } else if (window.scrollY <= 32) {
        setShowTitle(false);
      }
    };

    window.addEventListener('scroll', updateScrollPosition);

    return () => {
      window.removeEventListener('scroll', updateScrollPosition);
    };
  }, [params, setPageTitle, setShowTitle]);

  return (
    <>
      <Layout>
        <Container>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            {params.includes('cliente') && (
              <h1
                style={{
                  color: colors.primary,
                  fontSize: '26px',
                  fontWeight: '500',
                  margin: '0',
                }}
              >
                Dados do Cliente
              </h1>
            )}

            {params.includes('escritorio') && (
              <h1
                style={{
                  color: colors.primary,
                  fontSize: '26px',
                  fontWeight: '500',
                  margin: '0',
                }}
              >
                Descrição do Escritório
              </h1>
            )}

            {params.includes('usuario') && (
              <h1
                style={{
                  color: colors.primary,
                  fontSize: '26px',
                  fontWeight: '500',
                  margin: '0',
                }}
              >
                Descrição do Usuário
              </h1>
            )}

            {params.includes('trabalho') && (
              <h1
                style={{
                  color: colors.primary,
                  fontSize: '26px',
                  fontWeight: '500',
                  margin: '0',
                }}
              >
                Informações sobre o Trabalho
              </h1>
            )}

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #C0C0C0',
                borderRadius: '4px',
                padding: '8px 16px',
                gap: '8px',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (typeof window !== undefined) {
                  const searchParams = new URLSearchParams(window.location.search);
                  const id = searchParams.get('id');
                  router.push(
                    `/alterar/${
                      params.includes('cliente')
                        ? '?type=cliente/'
                        : params.includes('escritorio')
                        ? '?type=escritorio'
                        : params.includes('trabalho')
                        ? '?type=trabalho'
                        : '?type=usuario'
                    }${
                      params.includes('fisica')
                        ? 'pessoa_fisica'
                        : params.includes('juridica')
                        ? 'pessoa_juridica'
                        : params.includes('representante')
                        ? 'representante'
                        : params.includes('contador')
                        ? 'contador'
                        : ''
                    }&id=${id}`,
                  );
                }
              }}
            >
              <FiEdit
                style={{
                  marginBottom: '2px',
                }}
                size={24}
              />
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: colors.primary,
                }}
              >
                Alterar Dados
              </span>
            </button>
          </div>

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

export default Details;
