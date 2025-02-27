import { Box, Button, IconButton } from '@mui/material';
import { IDocumentApprovalProps } from '../../../../interfaces/IDocument';
import { colors, ContentContainer } from '../../../../styles/globals';
import { ContainerDetails, DetailsWrapper } from '../../../Details/styles';
import { GrDocumentText } from 'react-icons/gr';
import DocumentApprovalStepper from '../../DocumentApprovalStepper';
import { DataGrid } from '@mui/x-data-grid';
import { documentTypeToReadable } from '../../../../utils/constants';
import { downloadS3FileByUrl, openFileInNewTab } from '../../../../utils/files';
import { useModal } from '../../../../utils/useModal';
import GenericModal from '../../../Modals/GenericModal';
import { useRouter } from 'next/router';
import { TbDownload } from 'react-icons/tb';

interface DocumentApprovalStepThreeProps {
  documents: IDocumentApprovalProps[];
}

const DocumentApprovalStepThree: React.FC<DocumentApprovalStepThreeProps> = ({ documents }) => {
  const router = useRouter();
  const backModal = useModal();

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
            Tem certeza que deseja voltar para o dashboard de <strong>Revisão e Aprovação</strong>?
          </>
        }
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
          <DocumentApprovalStepper currentStep={2} />

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
                  headerName: 'Baixar Documento',
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
                  flex: 1,
                  field: 'open',
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
              {'Finalizar'}
            </Button>
          </Box>
        </ContentContainer>
      </DetailsWrapper>
    </>
  );
};

export default DocumentApprovalStepThree;
