import { Box, Button, IconButton, Typography } from '@mui/material';
import { IDocumentApprovalProps } from '../../../../../interfaces/IDocument';
import { documentTypeToReadable } from '../../../../../utils/constants';
import { openFileInNewTab } from '../../../../../utils/files';
import { GrDocumentText } from 'react-icons/gr';
import { colors } from '../../../../../styles/globals';
import { DataGrid } from '@mui/x-data-grid';
import { useModal } from '../../../../../utils/useModal';
import GenericModal from '../../../../Modals/GenericModal';
import { Dispatch, SetStateAction, useState } from 'react';
import { SignatureType } from '../../../../../types/signature';
import { zapSign } from '@/services/zapsign';
import { useRouter } from 'next/router';

interface DigitalSignatureProps {
  documents: IDocumentApprovalProps[];
  handleChangeStep: (action: 'previous' | 'next' | 'set', step?: number) => void;
  setSignatureType: Dispatch<SetStateAction<SignatureType>>;
  setShowRadioButtons: Dispatch<SetStateAction<boolean>>;
}

const DigitalSignature: React.FunctionComponent<DigitalSignatureProps> = ({
  documents,
  handleChangeStep,
  setSignatureType,
  setShowRadioButtons,
}) => {
  const [isSigning, setIsSigning] = useState(false);

  const router = useRouter();

  const backModal = useModal();
  const beginSignatureModal = useModal();
  const cancelSignatureModal = useModal();

  const { id: workId } = router.query;

  const handleGoBack = () => {
    handleChangeStep('previous');
  };

  const handleBeginSignature = async () => {
    setIsSigning(true);
    beginSignatureModal.close();
    setShowRadioButtons(false);

    try {
      const response = await zapSign(Number(workId));
    } catch (error) {}
  };

  const handleCancelSignature = () => {
    setIsSigning(false);
    cancelSignatureModal.close();
    setSignatureType('');
    setShowRadioButtons(true);
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

      {/* Begin Signature Modal */}
      <GenericModal
        showConfirmButton
        content="Tem certeza de que deseja assinar esses documentos digitalmente?"
        isOpen={beginSignatureModal.isOpen}
        onClose={beginSignatureModal.close}
        onConfirm={handleBeginSignature}
        confirmButtonText="Sim, assinar!"
      />

      {/* Cancel Signature Modal */}
      <GenericModal
        showConfirmButton
        content="Você tem certeza de que deseja cancelar a assinatura digital?"
        isOpen={cancelSignatureModal.isOpen}
        onClose={cancelSignatureModal.close}
        onConfirm={handleCancelSignature}
        confirmButtonText="Sim, cancelar"
        cancelButtonText="Voltar"
      />

      <Box className="mt-5">
        <p className="w-3/5 text-left">
          {isSigning ? (
            <>
              <strong className="font-bold">Status assinaturas:</strong>
              <br />
              Aguardando confirmação da plataforma de assinatura de documentos.
            </>
          ) : (
            <>
              <strong className="font-bold">Instruções para Assinatura digital:</strong> Para
              realizar a assinatura digital, clique em{' '}
              <strong className="font-bold">”Assinar digitalmente”</strong>, você receberá um e-mail
              com todas as informações para realizar a sua assinatura pela nossa plataforma.
            </>
          )}
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
                url: item.original_file_url,
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

          {isSigning && (
            <Typography className="mt-2">
              <strong className="font-bold">Obs:</strong> Não recebeu o email para assinar
              digitalmente?
              <br /> cancele está assinatura digital, volte no seu cadastro e confirme se o email do
              seu cliente está cadastrado corretamente.
            </Typography>
          )}
        </Box>

        <Box width={'100%'} display={'flex'} justifyContent={'center'} gap={'12px'} mt={'32px'}>
          {isSigning ? (
            <Button
              color="primary"
              variant="outlined"
              sx={{
                height: '36px',
                textTransform: 'none',
              }}
              onClick={cancelSignatureModal.open}
            >
              {'Cancelar assinatura digital'}
            </Button>
          ) : (
            <>
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
                {'Assinar Digitalmente'}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default DigitalSignature;
