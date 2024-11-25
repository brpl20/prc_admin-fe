import dynamic from 'next/dynamic';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, PageTitle } from '../../../styles/globals';
import { PageTitleContext } from '../../../contexts/PageTitleContext';
import { Footer } from '../../../components';
import { getWorkById } from '../../../services/works';
import { Button, CircularProgress } from '@mui/material';
import { IWorksListProps } from '../../../interfaces/IWork';
import { PiSuitcase } from 'react-icons/pi';
import { ContainerDetails, DetailsWrapper } from '../../../components/Details/styles';
import GenericConfirmationModal from '../../../components/Modals/GenericConfirmationModal';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const DocumentApproval = () => {
  const { showTitle, setShowTitle } = useContext(PageTitleContext);
  const router = useRouter();
  const { id, client, responsible } = router.query;

  const [loading, setLoading] = useState(true);
  const [workData, setWorkData] = useState<IWorksListProps>({} as IWorksListProps);

  const [isOpen, setIsOpen] = useState(false);

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

  const handleReturn = () => {
    setIsOpen(true);
  };

  return (
    <>
      <GenericConfirmationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => {
          router.push('/documentos');
        }}
        title="Atenção!"
        cancelButtonText="Cancel"
        confirmButtonText="Sim, voltar!"
        content={
          <>
            Ao voltar para o dashboard de <strong>Revisão e Aprovação</strong>, todos os dados não
            salvos serão perdidos, tem certeza que deseja realizar essa ação?
          </>
        }
      />
      <Layout>
        <Container>
          <div className="flex flex-row justify-between">
            <PageTitle showTitle={showTitle}>{'Revisão e Aprovação de Documentos'}</PageTitle>
          </div>
          <Button
            onClick={handleReturn}
            variant={'contained'}
            sx={{
              height: '36px',
              width: '100px',
              textTransform: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {'Voltar'}
          </Button>
          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '60vh',
              }}
            >
              <CircularProgress />
            </div>
          ) : !workData ? (
            <p>Não foram encontrados dados para o trabalho.</p>
          ) : (
            <DetailsWrapper
              style={{
                marginTop: 32,
                borderBottom: '1px solid #C0C0C0',
                boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
              }}
            >
              <ContainerDetails
                style={{
                  gap: '18px',
                }}
              >
                <>
                  <div
                    className="flex bg-white"
                    style={{
                      padding: '20px 32px 20px 32px',
                      borderBottom: '1px solid #C0C0C0',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <PiSuitcase size={24} color="#344054" />

                      <div className="w-[2px] bg-gray-300 h-8" />

                      <span
                        style={{
                          fontSize: '22px',
                          fontWeight: '500',
                          color: '#344054',
                        }}
                      >
                        Dados do Trabalho
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '18px',
                      paddingBottom: '20px',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '18px',
                        padding: '0 32px',
                      }}
                    >
                      <div
                        className="flex"
                        style={{
                          flexDirection: 'column',
                          gap: '8px',
                          alignItems: 'flex-start',
                        }}
                      >
                        <span
                          style={{
                            color: '#344054',
                            fontSize: '20px',
                            fontWeight: '500',
                          }}
                        >
                          Cliente:
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {client}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px] items-start">
                        <span
                          style={{
                            color: '#344054',
                            fontSize: '20px',
                            fontWeight: '500',
                          }}
                        >
                          Responsável:
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {responsible}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px] items-start">
                        <span
                          style={{
                            color: '#344054',
                            fontSize: '20px',
                            fontWeight: '500',
                          }}
                        >
                          CNPJ
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {workData.attributes.number}
                        </span>
                      </div>

                      <div className="flex flex-col gap-[8px] items-start">
                        <span
                          style={{
                            color: '#344054',
                            fontSize: '20px',
                            fontWeight: '500',
                          }}
                        >
                          Data de criação do trabalho:
                        </span>
                        <span
                          style={{
                            fontSize: '18px',
                            color: '#344054',
                            fontWeight: '400',
                          }}
                        >
                          {'XX/XX/XXXX'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              </ContainerDetails>
            </DetailsWrapper>
          )}
        </Container>
        <Footer />
      </Layout>
    </>
  );
};

export default DocumentApproval;
