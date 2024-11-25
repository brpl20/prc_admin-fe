import dynamic from 'next/dynamic';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  colors,
  Container,
  ContentContainer,
  DescriptionText,
  PageTitle,
} from '../../../styles/globals';
import { PageTitleContext } from '../../../contexts/PageTitleContext';
import { Footer } from '../../../components';
import { getWorkById } from '../../../services/works';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { IWorksListProps } from '../../../interfaces/IWork';
import { GrDocumentText } from 'react-icons/gr';
import { TbDownload } from 'react-icons/tb';
import { ContainerDetails, DetailsWrapper } from '../../../components/Details/styles';
import GenericModal from '../../../components/Modals/GenericModal';
import { documentApprovalSteps, documentTypeToReadable } from '../../../utils/constants';
import { DataGrid } from '@mui/x-data-grid';
import IDocumentProps from '../../../interfaces/IDocument';
import WorkInfoCard from '../../../components/DocumentApproval/WorkInfoCard';
import downloadFileByUrl from '../../../utils/downloadFileByUrl';
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });

interface IDocumentApprovalProps extends IDocumentProps {
  pending_revision: boolean;
}

const DocumentApproval = () => {
  const { showTitle, setShowTitle } = useContext(PageTitleContext);
  const router = useRouter();
  const { id, client, responsible } = router.query;

  const [loading, setLoading] = useState(true);
  const [workData, setWorkData] = useState<IWorksListProps>({} as IWorksListProps);
  const [documents, setDocuments] = useState<IDocumentApprovalProps[]>([]);

  const [isOpen, setIsOpen] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);

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
    setIsOpen(true);
  };

  const handleApproveDocuments = () => {
    setDocuments(prevDocuments =>
      prevDocuments.map(doc =>
        selectedDocuments.includes(doc.id) ? { ...doc, pending_revision: false } : doc,
      ),
    );
    setSelectedDocuments([]);
  };

  return (
    <>
      <GenericModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
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

              <DetailsWrapper
                style={{
                  marginTop: 32,
                  borderBottom: '1px solid #C0C0C0',
                  backgroundColor: '#fff',
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
                        <GrDocumentText size={22} color="#344054" />

                        <div className="w-[2px] bg-gray-300 h-8" />

                        <span
                          style={{
                            fontSize: '22px',
                            fontWeight: '500',
                            color: '#344054',
                          }}
                        >
                          Documentação
                        </span>
                      </div>
                    </div>
                  </>
                </ContainerDetails>
                <ContentContainer>
                  <Box>
                    <Stepper activeStep={currentStep}>
                      {documentApprovalSteps.map((label: string, index: number) => (
                        <Step
                          key={label}
                          onClick={() => {
                            //*
                          }}
                        >
                          <StepLabel
                            StepIconProps={{
                              style: {
                                color:
                                  currentStep > index
                                    ? '#26B99A'
                                    : currentStep === index
                                    ? '#01013D'
                                    : '#A8A8B3',
                                cursor: 'pointer',
                              },
                            }}
                          >
                            <DescriptionText
                              style={{
                                color:
                                  currentStep > index
                                    ? '#26B99A'
                                    : currentStep === index
                                    ? '#01013D'
                                    : '#A8A8B3',
                                cursor: 'pointer',
                              }}
                            >
                              {label}
                            </DescriptionText>
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                    <Box
                      sx={{
                        width: '100% !important',
                        height: '2px',
                        backgroundColor: '#01013D',
                        marginTop: '24px',
                      }}
                    ></Box>
                  </Box>

                  <Box sx={{ width: '100%' }}>
                    <DataGrid
                      disableColumnMenu
                      checkboxSelection
                      disableRowSelectionOnClick
                      isRowSelectable={(params: any) => params.row.showCheckbox}
                      loading={loading}
                      slots={{
                        noRowsOverlay: () =>
                          loading ? (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <LinearProgress />
                            </Box>
                          ) : (
                            <Typography variant="h6">{'Nenhum Poder Encontrado'}</Typography>
                          ),
                      }}
                      rows={documents.map((item: IDocumentApprovalProps) => {
                        return {
                          id: item.id,
                          type: documentTypeToReadable[item.document_type],
                          status: item.pending_revision
                            ? 'Pendente de Revisão'
                            : 'Documento Aprovado',
                          url: item.url,
                          showCheckbox: item.pending_revision,
                        };
                      })}
                      columns={[
                        {
                          flex: 3,
                          field: 'type',
                          headerAlign: 'center',
                          headerName: 'Documentos',
                          align: 'center',
                        },
                        {
                          flex: 1,
                          field: 'status',
                          headerAlign: 'center',
                          headerName: 'Status',
                          align: 'center',
                        },
                        {
                          flex: 1,
                          field: 'download',
                          headerAlign: 'center',
                          headerName: 'Download',
                          align: 'center',
                          renderCell: (params: any) => (
                            <div>
                              <IconButton
                                aria-label="open"
                                onClick={_ => downloadFileByUrl(params.row.url)}
                              >
                                <TbDownload size={22} color={colors.icons} cursor={'pointer'} />
                              </IconButton>
                            </div>
                          ),
                        },
                      ]}
                      initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                      }}
                      localeText={{
                        MuiTablePagination: {
                          labelRowsPerPage: 'Linhas por página',
                          labelDisplayedRows(paginationInfo) {
                            return `${paginationInfo.from}- ${paginationInfo.to} de ${paginationInfo.count}`;
                          },
                        },
                      }}
                      pageSizeOptions={[5, 10, 25]}
                      onRowSelectionModelChange={(data: any) => {
                        setSelectedDocuments(data);
                      }}
                      rowSelectionModel={selectedDocuments}
                    />
                  </Box>

                  <Box
                    width={'100%'}
                    display={'flex'}
                    justifyContent={'center'}
                    gap={'12px'}
                    mt={'20px'}
                  >
                    {selectedDocuments.length > 0 && (
                      <>
                        <Button
                          color="primary"
                          variant="outlined"
                          sx={{
                            height: '36px',
                            textTransform: 'none',
                          }}
                          onClick={() => {}}
                        >
                          {'Revisar manualmente'}
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            height: '36px',
                            color: colors.white,
                            textTransform: 'none',
                          }}
                          color="secondary"
                          onClick={handleApproveDocuments}
                        >
                          {'Aprovar documentos'}
                        </Button>
                      </>
                    )}
                    {documents.every(doc => !doc.pending_revision) && (
                      <Button
                        variant="contained"
                        sx={{
                          height: '36px',
                          color: colors.white,
                          textTransform: 'none',
                        }}
                        color="secondary"
                        onClick={() => {
                          /**/
                        }}
                      >
                        {'Ir para assinaturas'}
                      </Button>
                    )}
                  </Box>
                </ContentContainer>
              </DetailsWrapper>
            </>
          )}
        </Container>
        <Footer />
      </Layout>
    </>
  );
};

export default DocumentApproval;
