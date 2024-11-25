import dynamic from 'next/dynamic';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, ContentContainer, PageTitle } from '../../../styles/globals';
import { PageTitleContext } from '../../../contexts/PageTitleContext';
import { Footer } from '../../../components';
import { getWorkById } from '../../../services/works';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const DocumentApproval = () => {
  const { showTitle, setShowTitle } = useContext(PageTitleContext);
  const router = useRouter();
  const { id, client, responsible } = router.query;

  const [loading, setLoading] = useState(true);
  const [workData, setWorkData] = useState<any>(null);

  const fetchWorkData = async (workId: string) => {
    try {
      setLoading(true);
      const { data } = await getWorkById(workId);
      setWorkData(data);
    } catch (error) {
      console.error(`Error when fetching work of id=${workId}`, error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (typeof id === 'string') {
      fetchWorkData(id);
    }
  }, [id]);

  return (
    <>
      <Layout>
        <Container>
          <div className="flex flex-row justify-between">
            <PageTitle showTitle={showTitle}>{'Revisão e Aprovação de Documentos'}</PageTitle>
          </div>
          <ContentContainer>
            {loading ? (
              <p>Carregando...</p>
            ) : workData ? (
              <div>
                <h1>Detalhes do Documento</h1>
                <p>
                  <strong>ID:</strong> {id}
                </p>
                <p>
                  <strong>Cliente:</strong> {client || 'N/A'}
                </p>
                <p>
                  <strong>Responsável:</strong> {responsible || 'N/A'}
                </p>
                <p>
                  <strong>Dados do Trabalho:</strong> {JSON.stringify(workData, null, 2)}
                </p>
              </div>
            ) : (
              <p>Não foram encontrados dados para o trabalho.</p>
            )}
          </ContentContainer>
        </Container>
        <Footer />
      </Layout>
    </>
  );
};

export default DocumentApproval;
