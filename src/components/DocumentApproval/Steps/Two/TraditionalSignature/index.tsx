import { Box, Button, IconButton } from '@mui/material';
import IDocumentProps, {
  IDocumentApprovalProps,
  IDocumentRevisionProps,
} from '../../../../../interfaces/IDocument';
import { documentTypeToReadable } from '../../../../../utils/constants';
import { downloadS3FileByUrl } from '../../../../../utils/files';
import { colors } from '../../../../../styles/globals';
import { DataGrid } from '@mui/x-data-grid';
import { useModal } from '../../../../../utils/useModal';
import GenericModal from '../../../../Modals/GenericModal';
import { TbDownload, TbUpload } from 'react-icons/tb';
import { useState } from 'react';
import DocumentUploadModal from '@/components/Modals/DocumentUploadModal';
import { useRouter } from 'next/router';
import { uploadSignedDocument } from '@/services/works';
import { Notification } from '@/components';

interface TraditionalSignatureProps {
  documents: IDocumentProps[];
  handleChangeStep: (action: 'previous' | 'next' | 'set', step?: number) => void;
}

const TraditionalSignature: React.FunctionComponent<TraditionalSignatureProps> = ({
  documents,
  handleChangeStep,
}) => {
  const backModal = useModal();
  const uploadWarningModal = useModal();
  const confirmSignatureModal = useModal();
  const uploadModal = useModal();
  const router = useRouter();

  const [signatureDocuments, setSignatureDocuments] = useState<IDocumentRevisionProps[]>(
    documents.map(doc => ({ file: null, ...doc })),
  );
  const [currentDocumentId, setCurrentDocumentId] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { id: workId } = router.query;

  const handleGoBack = () => {
    handleChangeStep('previous');
  };

  const handleSignButton = () => {
    const pendingDocuments = signatureDocuments.filter(doc => !doc.file);

    if (pendingDocuments.length > 0) {
      return uploadWarningModal.open();
    }

    confirmSignatureModal.open();
  };

  const handleSignature = async () => {
    setLoading(true);
    try {
      const uploadPromises = signatureDocuments.map(doc => {
        return uploadSignedDocument(Number(workId), doc.id, doc.file!);
      });

      await Promise.all(uploadPromises);

      // Success
      handleChangeStep('next');
    } catch (error) {
      setErrorMessage('Ocorreu um erro ao enviar os arquivos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploaded = (file: File) => {
    setSignatureDocuments(prev =>
      prev.map(doc => (doc.id === currentDocumentId ? { ...doc, file: file } : doc)),
    );
  };

  return (
    <>
      {/* Signed Document Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModal.isOpen}
        onClose={() => {
          uploadModal.close();
          setCurrentDocumentId(undefined);
        }}
        onSuccess={handleFileUploaded}
        documentId={currentDocumentId}
        workId={Number(workId)}
      />

      {/* Back Modal */}
      <GenericModal
        content="Tem certeza que deseja cancelar, e iniciar o processo de revisão dos documentos novamente?"
        isOpen={backModal.isOpen}
        onClose={backModal.close}
        onConfirm={handleGoBack}
        showConfirmButton
        cancelButtonText="Cancelar"
        confirmButtonText="Sim, voltar e revisar!"
      />

      {/* Upload Warning Modal */}
      <GenericModal
        content="Para confirmar as assinaturas, realize o upload de todos os documentos assinados!"
        isOpen={uploadWarningModal.isOpen}
        onClose={uploadWarningModal.close}
        cancelButtonText="Fechar"
      />

      {/* Confirm Signature Modal */}
      <GenericModal
        content="Tem certeza que deseja confirmar todas as assinaturas?"
        isOpen={confirmSignatureModal.isOpen}
        onClose={confirmSignatureModal.close}
        onConfirm={handleSignature}
        showConfirmButton
        cancelButtonText="Cancelar"
        confirmButtonText={loading ? 'Enviando...' : 'Sim, confirmar!'}
      />

      <Box className="mt-5">
        <p className="w-3/5 text-left">
          <strong className="font-bold">Instruções para Assinatura tradicional:</strong> Para
          realizar a assinatura tradicional imprima os documentos, realize a assinatura, digitalize
          e faça o upload novamente na plataforma.
        </p>

        <Box className="w-full mt-4">
          <DataGrid
            disableColumnMenu
            hideFooter
            disableRowSelectionOnClick
            rows={signatureDocuments.map((item: IDocumentRevisionProps) => {
              return {
                id: item.id,
                type: documentTypeToReadable[item.document_type],
                url: item.original_file_url,
                status: item.file ? 'Upload realizado' : 'Pendente de upload',
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
                flex: 1,
                field: 'download',
                headerAlign: 'center',
                headerName: 'Download de documento',
                align: 'center',
                renderCell: (params: any) => (
                  <Box>
                    <IconButton
                      aria-label="open"
                      onClick={_ => {
                        downloadS3FileByUrl(params.row.url);
                      }}
                    >
                      <TbDownload size={22} color={colors.icons} cursor={'pointer'} />
                    </IconButton>
                  </Box>
                ),
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
                  <Box>
                    <IconButton
                      aria-label="open"
                      onClick={_ => {
                        uploadModal.open();
                        setCurrentDocumentId(params.row.id);
                      }}
                    >
                      <TbUpload size={22} color={colors.icons} cursor={'pointer'} />
                    </IconButton>
                  </Box>
                ),
              },
            ]}
          />
        </Box>

        <Box width={'100%'} display={'flex'} justifyContent={'center'} gap={'12px'} mt={'32px'}>
          <Button
            color="primary"
            variant="outlined"
            sx={{
              height: '36px',
              textTransform: 'none',
            }}
            onClick={backModal.open}
          >
            {'Cancelar e voltar ao passo anterior'}
          </Button>
          <Button
            variant="contained"
            sx={{
              height: '36px',
              color: colors.white,
              textTransform: 'none',
            }}
            color="secondary"
            onClick={handleSignButton}
          >
            {'Confirmar assinaturas'}
          </Button>
        </Box>
      </Box>
      <Notification
        open={!!errorMessage}
        message={errorMessage}
        severity={'error'}
        onClose={() => setErrorMessage('')}
      />
    </>
  );
};

export default TraditionalSignature;
