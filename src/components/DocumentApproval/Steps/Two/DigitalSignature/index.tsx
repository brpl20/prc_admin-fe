import { Box, Button, IconButton } from '@mui/material';
import { IDocumentApprovalProps } from '../../../../../interfaces/IDocument';
import { documentTypeToReadable } from '../../../../../utils/constants';
import { openFileInNewTab } from '../../../../../utils/files';
import { GrDocumentText } from 'react-icons/gr';
import { colors } from '../../../../../styles/globals';
import { DataGrid } from '@mui/x-data-grid';
import { useModal } from '../../../../../utils/useModal';
import GenericModal from '../../../../Modals/GenericModal';

interface DigitalSignatureProps {
  documents: IDocumentApprovalProps[];
  handleChangeStep: (action: 'previous' | 'next' | 'set', step?: number) => void;
}

const DigitalSignature: React.FunctionComponent<DigitalSignatureProps> = ({
  documents,
  handleChangeStep,
}) => {
  const backModal = useModal();

  const handleBackModalConfirm = () => {
    handleChangeStep('previous');
  };

  return (
    <>
      {/* Back modal */}
      <GenericModal
        content="Tem certeza que deseja cancelar, e iniciar o processo de revisão dos documentos novamente?"
        isOpen={backModal.isOpen}
        onClose={backModal.close}
        onConfirm={handleBackModalConfirm}
        showConfirmButton
        cancelButtonText="Cancelar"
        confirmButtonText="Sim, voltar e revisar!"
      />

      <Box className="mt-5">
        <p className="w-3/5 text-left">
          <strong className="font-bold">Instruções para Assinatura digital:</strong> Para realizar a
          assinatura digital, clique em{' '}
          <strong className="font-bold">”Assinar digitalmente”</strong>, você receberá um e-mail com
          todas as informações para realizar a sua assinatura pela nossa plataforma.
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

        <Box width={'100%'} display={'flex'} justifyContent={'center'} gap={'12px'} mt={'20px'}>
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
            onClick={() => {}}
          >
            {'Assinar Digitalmente'}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default DigitalSignature;
