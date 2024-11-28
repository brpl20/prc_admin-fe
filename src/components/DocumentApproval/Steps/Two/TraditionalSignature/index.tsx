import { Box, Button, IconButton, Typography } from '@mui/material';
import { IDocumentApprovalProps } from '../../../../../interfaces/IDocument';
import { documentTypeToReadable } from '../../../../../utils/constants';
import { openFileInNewTab } from '../../../../../utils/files';
import { GrDocumentText } from 'react-icons/gr';
import { colors } from '../../../../../styles/globals';
import { DataGrid } from '@mui/x-data-grid';
import { useModal } from '../../../../../utils/useModal';
import GenericModal from '../../../../Modals/GenericModal';

interface TraditionalSignatureProps {
  documents: IDocumentApprovalProps[];
  handleChangeStep: (action: 'previous' | 'next' | 'set', step?: number) => void;
}

const TraditionalSignature: React.FunctionComponent<TraditionalSignatureProps> = ({
  documents,
  handleChangeStep,
}) => {
  const backModal = useModal();
  const uploadWarningModal = useModal();
  const confirmSignatureModal = useModal();

  const handleGoBack = () => {
    handleChangeStep('previous');
  };

  return (
    <>
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
        onConfirm={() => {}}
        showConfirmButton
        cancelButtonText="Cancelar"
        confirmButtonText="Sim, confirmar!"
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
            rows={documents.map((item: IDocumentApprovalProps) => {
              return {
                id: item.id,
                type: documentTypeToReadable[item.document_type],
                url: item.url,
              };
            })}
            columns={[
              {
                flex: 4,
                field: 'type',
                headerAlign: 'center',
                headerName: 'Documentos',
                align: 'center',
              },
              {
                flex: 1,
                field: 'download',
                headerAlign: 'center',
                headerName: 'Ver Documento',
                align: 'center',
                renderCell: (params: any) => (
                  <Box>
                    <IconButton
                      aria-label="open"
                      onClick={_ => {
                        openFileInNewTab(params.row.url);
                      }}
                    >
                      <GrDocumentText size={22} color={colors.icons} cursor={'pointer'} />
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
            onClick={beginSignatureModal.open}
          >
            {'Confirmar assinaturas'}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default TraditionalSignature;
