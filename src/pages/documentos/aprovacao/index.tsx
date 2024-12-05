import dynamic from 'next/dynamic';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, PageTitle } from '../../../styles/globals';
import { PageTitleContext } from '../../../contexts/PageTitleContext';
import { Footer } from '../../../components';
import { getWorkById } from '../../../services/works';
import { Button, CircularProgress } from '@mui/material';
import { IWorksListProps } from '../../../interfaces/IWork';
import GenericModal from '../../../components/Modals/GenericModal';
import { IDocumentApprovalProps } from '../../../interfaces/IDocument';
import WorkInfoCard from '../../../components/DocumentApproval/WorkInfoCard';
import { useModal } from '../../../utils/useModal';
import DocumentApprovalStepHandler from '../../../components/DocumentApproval/StepHandler';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

const DocumentApproval = () => {
  const { showTitle, setShowTitle } = useContext(PageTitleContext);
  const router = useRouter();

  const { id, client, responsible } = router.query;

  if (!id || !client) {
    return (
      <p>
        Ocorreu um erro ao buscar o ID, Cliente e Advogado Responsável pelo trabalho. Tente
        novamente.
      </p>
    );
  }

  const [loading, setLoading] = useState(true);
  const [workData, setWorkData] = useState<IWorksListProps>({} as IWorksListProps);
  const [documents, setDocuments] = useState<IDocumentApprovalProps[]>([]);

  const backModal = useModal();

  const [currentStep, setCurrentStep] = useState(0);

  const fetchWorkData = async (workId: string) => {
    try {
      setLoading(true);
      const { data }: { data: IWorksListProps } = await getWorkById(workId);
      setWorkData(data);

      const updatedDocuments = data.attributes.documents.map(doc => ({
        ...doc,
        pending_revision: true,
      }));

      setDocuments(updatedDocuments);
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
    backModal.open();
  };

  const handleChangeStep = (action: 'next' | 'previous' | 'set', step?: number) => {
    setCurrentStep(prevStep => {
      switch (action) {
        case 'next':
          return prevStep + 1;
        case 'previous':
          return prevStep - 1;
        case 'set':
          return step || 0;
        default:
          return prevStep;
      }
    });

    if (currentStep === 0) {
      fetchWorkData(id as string);
    }
  };

  return (
    <>
      {/* Back Modal */}
      <GenericModal
        isOpen={backModal.isOpen}
        onClose={backModal.close}
        onConfirm={() => {
          router.push('/documentos');
        }}
        title="Atenção!"
        showConfirmButton
        cancelButtonText="Cancelar"
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
            <>
              <WorkInfoCard
                client={client}
                responsible={responsible}
                number={workData.attributes.number}
              />

              <DocumentApprovalStepHandler
                step={currentStep}
                handleChangeStep={handleChangeStep}
                documents={documents}
                setDocuments={setDocuments}
              />
            </>
          )}
        </Container>
        <Footer />
      </Layout>
    </>
  );
};

export default DocumentApproval;
