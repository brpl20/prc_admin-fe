import { Box, Button, IconButton, Typography } from '@mui/material';
import { IDocumentApprovalProps, IDocumentRevisionProps } from '../../../../interfaces/IDocument';
import { DataGrid } from '@mui/x-data-grid';
import { documentTypeToReadable } from '../../../../utils/constants';
import { TbDownload, TbUpload } from 'react-icons/tb';
import { colors, ContentContainer } from '../../../../styles/globals';
import { useModal } from '../../../../utils/useModal';
import GenericModal from '../../../Modals/GenericModal';
import { Dispatch, SetStateAction, useState } from 'react';
import { ContainerDetails, DetailsWrapper } from '../../../Details/styles';
import { GrDocumentText } from 'react-icons/gr';
import DocumentApprovalStepper from '../../DocumentApprovalStepper';
import { downloadS3FileByUrl } from '../../../../utils/files';
import DocumentRevisionModal from '@/components/Modals/DocumentRevisionModal';
import { useRouter } from 'next/router';
import { convertDocumentsToPdf, uploadDocumentForRevision } from '@/services/works';
import { Notification } from '@/components';

interface DocumentApprovalStepOneProps {
  documents: IDocumentApprovalProps[];
  setDocuments: Dispatch<SetStateAction<IDocumentApprovalProps[]>>;
  handleChangeStep: (action: 'previous' | 'next' | 'set', step?: number) => void;
  refetch: () => void;
}

const DocumentApprovalStepOne: React.FC<DocumentApprovalStepOneProps> = ({
  documents,
  setDocuments,
  handleChangeStep,
  refetch,
}) => {
  const [selectedDocumentsIds, setSelectedDocumentsIds] = useState<number[]>([]);
  const [revisionDocuments, setRevisionDocuments] = useState<IDocumentRevisionProps[]>([]);

  const [isRevisionActive, setIsRevisionActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentDocumentId, setCurrentDocumentId] = useState<number>();

  const quickApproveModal = useModal();
  const revisionApproveModal = useModal();
  const uploadPendingModal = useModal();

  const uploadModal = useModal();
  const router = useRouter();

  const { id: workId } = router.query;

  const handleQuickApproveModalApprove = async () => {
    setLoading(true);
    try {
      await convertDocumentsToPdf(Number(workId), selectedDocumentsIds);
      refetch();
    } catch (error) {
      setErrorMessage('Ocorreu um erro ao aprovar os documentos. Por favor, tente novamente.');
      setShowError(true);
      console.error('Error on approval:', error);
    } finally {
      setLoading(false);
      quickApproveModal.close();
    }
  };

  const handleRevisionModalApprove = async () => {
    const pendingDocuments = revisionDocuments.filter(doc => doc.file === null);

    if (pendingDocuments.length > 0) {
      return uploadPendingModal.open();
    }

    setLoading(true);
    try {
      const uploadPromises = revisionDocuments.map(doc => {
        const formData = new FormData();
        formData.append('file', doc.file!);

        return uploadDocumentForRevision(Number(workId), doc.id, formData);
      });

      await Promise.all(uploadPromises);
      await convertDocumentsToPdf(
        Number(workId),
        revisionDocuments.map(doc => doc.id),
      );
      refetch();

      setRevisionDocuments([]);
      setIsRevisionActive(false);
      revisionApproveModal.close();
    } catch (error) {
      setShowError(true);
      setErrorMessage('Ocorreu um erro ao enviar os arquivos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBeginRevision = () => {
    const selectedDocsForRevision: IDocumentRevisionProps[] = documents
      .filter(doc => selectedDocumentsIds.includes(doc.id))
      .map(doc => ({
        ...doc,
        file: null, // Add revision-required prop
      }));

    const remainingDocuments = documents.filter(doc => !selectedDocumentsIds.includes(doc.id));

    setDocuments(remainingDocuments);
    setRevisionDocuments(prev => [...prev, ...selectedDocsForRevision]);
    setSelectedDocumentsIds([]);
    setIsRevisionActive(true);
  };

  const handleCancelRevision = () => {
    const docsToRestore = revisionDocuments.map(doc => ({
      ...doc,
      pending_revision: true,
    }));

    setDocuments(prev => [...prev, ...docsToRestore]);
    setRevisionDocuments([]);
    revisionApproveModal.close();
    setIsRevisionActive(false);
  };

  const handleRevisionApproveButton = () => {
    // If any revision documents are pending upload, show a warning
    if (revisionDocuments.some(doc => doc.file === null)) {
      return uploadPendingModal.open();
    }

    // else, let them be approved
    revisionApproveModal.open();
  };

  const approveSelectedDocuments = () => {
    setDocuments(prevDocuments =>
      prevDocuments.map(doc =>
        selectedDocumentsIds.includes(doc.id) ? { ...doc, pending_revision: false } : doc,
      ),
    );
    setSelectedDocumentsIds([]);
  };

  const handleFileUploaded = (file: File) => {
    setRevisionDocuments(prev =>
      prev.map(doc => (doc.id === currentDocumentId ? { ...doc, file: file } : doc)),
    );
  };
  return (
    <>
      {/* Document Revision Modal */}
      <DocumentRevisionModal
        isOpen={uploadModal.isOpen}
        onClose={() => {
          uploadModal.close();
          setCurrentDocumentId(undefined);
        }}
        onSuccess={handleFileUploaded}
        documentId={currentDocumentId}
        workId={Number(workId)}
      />

      {/* Quick Approve Modal */}
      <GenericModal
        isOpen={quickApproveModal.isOpen}
        onClose={quickApproveModal.close}
        onConfirm={handleQuickApproveModalApprove}
        title="Atenção!"
        showConfirmButton
        confirmButtonText={loading ? 'Aprovando...' : 'Sim, aprovar!'}
        cancelButtonText="Cancelar"
        content="Tem certeza de que deseja aprovar os documentos?"
      />

      {/* Revision Approve Modal */}
      <GenericModal
        isOpen={revisionApproveModal.isOpen}
        onClose={revisionApproveModal.close}
        onConfirm={handleRevisionModalApprove}
        title="Atenção!"
        showConfirmButton
        confirmButtonText={loading ? 'Aprovando...' : 'Sim, aprovar!'}
        cancelButtonText="Cancelar"
        content="Tem certeza de que deseja aprovar os documentos?"
      />

      {/* Revision Upload Pending Modal */}
      <GenericModal
        isOpen={uploadPendingModal.isOpen}
        onClose={uploadPendingModal.close}
        title="Atenção!"
        cancelButtonText="Fechar"
        content="Para aprovar a documentação, realize o upload de todos os documentos!"
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
          <DocumentApprovalStepper currentStep={0} />

          <Box sx={{ width: '100%', height: '330px' }}>
            <DataGrid
              disableColumnMenu
              checkboxSelection
              hideFooter
              disableRowSelectionOnClick
              isRowSelectable={(params: any) => params.row.showCheckbox}
              slots={{
                noResultsOverlay: () => (
                  <Typography variant="h6">{'Nenhum Documento Encontrado'}</Typography>
                ),
              }}
              rows={documents.map((item: IDocumentApprovalProps) => {
                return {
                  id: item.id,
                  type: documentTypeToReadable[item.document_type],
                  status: item.status,
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
                        onClick={_ => downloadS3FileByUrl(params.row.url)}
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
                noRowsLabel: 'Documentos aguardando revisão.',
                MuiTablePagination: {
                  labelRowsPerPage: 'Linhas por página',
                  labelDisplayedRows(paginationInfo) {
                    return `${paginationInfo.from}- ${paginationInfo.to} de ${paginationInfo.count}`;
                  },
                },
              }}
              onRowSelectionModelChange={(data: any) => {
                setSelectedDocumentsIds(data);
              }}
              rowSelectionModel={selectedDocumentsIds}
            />
          </Box>

          <Box width={'100%'} display={'flex'} justifyContent={'center'} gap={'12px'} mt={'20px'}>
            {selectedDocumentsIds.length > 0 && (
              <>
                <Button
                  color="primary"
                  variant="outlined"
                  sx={{
                    height: '36px',
                    textTransform: 'none',
                  }}
                  onClick={handleBeginRevision}
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
                  onClick={quickApproveModal.open}
                >
                  Aprovar documentos
                </Button>
              </>
            )}
            {documents.every(doc => !doc.pending_revision) && !isRevisionActive && (
              <Button
                variant="contained"
                sx={{
                  height: '36px',
                  color: colors.white,
                  textTransform: 'none',
                }}
                color="secondary"
                onClick={() => handleChangeStep('next')}
              >
                {'Ir para assinaturas'}
              </Button>
            )}
          </Box>
        </ContentContainer>
      </DetailsWrapper>

      {isRevisionActive && (
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
                    Revisar manualmente
                  </span>
                </div>
              </div>
            </>

            <p className="w-4/5 text-left px-8">
              <strong className="font-bold">Instruções para revisão:</strong> Para realizar a
              revisão manualmente, faça o download do documento que está no formato DOCX, realize os
              ajustes necessários, faça o upload do documento novamente e para finalizar clique em
              Aprovar documentos.
            </p>
          </ContainerDetails>

          <ContentContainer>
            <Box sx={{ width: '100%' }}>
              <DataGrid
                disableColumnMenu
                hideFooter
                slots={{
                  noResultsOverlay: () => (
                    <Typography variant="h6">{'Nenhum Documento Encontrado'}</Typography>
                  ),
                }}
                rows={revisionDocuments.map((item: IDocumentRevisionProps) => {
                  return {
                    id: item.id,
                    type: documentTypeToReadable[item.document_type],
                    status: item.file === null ? 'Pendente de upload' : 'Upload realizado',
                    url: item.url,
                  };
                })}
                columns={[
                  {
                    flex: 2,
                    field: 'type',
                    headerAlign: 'center',
                    headerName: 'Documentos',
                    align: 'center',
                  },
                  {
                    flex: 2,
                    field: 'status',
                    headerAlign: 'center',
                    headerName: 'Status do upload',
                    align: 'center',
                  },
                  {
                    flex: 1,
                    field: 'upload',
                    headerAlign: 'center',
                    headerName: 'Upload de documento',
                    align: 'center',
                    renderCell: (params: any) => (
                      <div>
                        <IconButton
                          onClick={_ => {
                            uploadModal.open();
                            setCurrentDocumentId(params.row.id);
                          }}
                        >
                          <TbUpload size={22} color={colors.icons} cursor={'pointer'} />
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
              />
            </Box>

            <Box width={'100%'} display={'flex'} justifyContent={'center'} gap={'12px'} mt={'20px'}>
              <>
                <Button
                  color="primary"
                  variant="outlined"
                  sx={{
                    height: '36px',
                    textTransform: 'none',
                  }}
                  onClick={handleCancelRevision}
                >
                  {'Cancelar revisão'}
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    height: '36px',
                    color: colors.white,
                    textTransform: 'none',
                  }}
                  color="secondary"
                  onClick={handleRevisionApproveButton}
                >
                  {'Aprovar documentos'}
                </Button>
              </>
            </Box>
          </ContentContainer>
        </DetailsWrapper>
      )}
      {showError && (
        <Notification
          open={showError}
          message={errorMessage}
          severity="error"
          onClose={() => setShowError(false)}
        />
      )}
    </>
  );
};

export default DocumentApprovalStepOne;
