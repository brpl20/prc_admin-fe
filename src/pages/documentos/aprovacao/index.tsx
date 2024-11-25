import dynamic from 'next/dynamic';
import { useContext, useEffect } from 'react';
import { Container, ContentContainer, PageTitle } from '../../../styles/globals';
import { PageTitleContext } from '../../../contexts/PageTitleContext';
import { Footer } from '../../../components';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const DocuimentApproval = () => {
  const { showTitle, setShowTitle } = useContext(PageTitleContext);

  useEffect(() => {
    const updateScrollPosition = () => {
      if (window.scrollY >= 49) {
        setShowTitle(true);
      } else if (window.scrollY <= 32) {
        setShowTitle(false);
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
          <div className="flex flex-row justify-between">
            <PageTitle showTitle={showTitle}>{'Revisão e Aprovação de Documentos'}</PageTitle>
          </div>
          <ContentContainer></ContentContainer>
        </Container>
        <Footer />
      </Layout>
    </>
  );
};

export default DocuimentApproval;
