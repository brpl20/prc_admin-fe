import { Box, Modal, Button, Typography } from '@mui/material';
import { colors, Flex } from '@/styles/globals';
import { MdClose, MdDelete } from 'react-icons/md';
import { Content, DropContainer, FileList } from './styles';
import Dropzone from 'react-dropzone';
import { ChangeEvent, DragEvent, useState } from 'react';
import { Notification } from '@/components';
import { uploadDocumentForRevision } from '@/services/works';

interface IDocumentRevisionModalProps {
  workId: number;
  documentId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (file: File) => void;
  title?: string;
  content?: React.ReactNode;
  showConfirmButton?: boolean;
  cancelButtonText?: string;
  confirmButtonText?: string;
}

const DocumentRevisionModal = ({
  workId,
  documentId,
  isOpen,
  onClose,
  onSuccess,
  title = 'Upload de Arquivos',
  content,
  showConfirmButton = true,
  cancelButtonText = 'Cancelar',
  confirmButtonText = 'Enviar',
}: IDocumentRevisionModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const allowedFileExtensions = ['docx', 'pdf'];

  const getDropZoneText = (isDragActive: boolean) => {
    if (selectedFile) {
      return 'Arquivo selecionado.';
    }

    if (isDragActive) {
      return 'Solte o arquivo aqui.';
    }

    return 'Arraste arquivos aqui...';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;

    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      const fileExtension = droppedFile.name.split('.').pop()?.toLowerCase();

      if (fileExtension && allowedFileExtensions.includes(fileExtension)) {
        setSelectedFile(droppedFile);
      } else {
        setShowError(true);
        setErrorMessage(
          'Formato de arquivo inválido. Por favor, escolha um arquivo .docx ou .pdf.',
        );
      }
    }
  };

  const handleDeleteFile = () => {
    setSelectedFile(null);
  };

  const handleFileUpload = async () => {
    if (selectedFile && documentId) {
      onSuccess && onSuccess(selectedFile);
      handleClose();
    } else {
      setShowError(true);
      setErrorMessage('Por favor, selecione um arquivo antes de enviar.');
    }
  };

  const handleClose = () => [setSelectedFile(null), onClose()];

  return (
    <>
      <Modal open={isOpen} onClose={onClose} style={{ overflowY: 'auto' }}>
        <Content className="!w-[600px]">
          <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
            <label style={{ fontSize: '28px', color: '#01013D', fontWeight: '500' }}>{title}</label>
            <Box sx={{ cursor: 'pointer' }} onClick={onClose}>
              <MdClose size={26} onClick={onClose} />
            </Box>
          </Box>
          <Box mt={'8px'} width={'100%'} height={'1px'} bgcolor={colors.quartiary} />

          <Box mt={'10px'}>
            <>
              <Typography variant="subtitle1" className="leading-6">
                {content}
              </Typography>
              <Box sx={{ width: '100%', height: '100%' }}>
                <Flex
                  style={{
                    flexDirection: 'row',
                    boxSizing: 'border-box',
                    height: '200px',
                    gap: '12px',
                  }}
                >
                  <Dropzone disabled={!!selectedFile}>
                    {({ getRootProps, getInputProps, isDragActive }) => (
                      <DropContainer {...getRootProps()} isDragActive={isDragActive}>
                        <Flex
                          onDrop={handleDrop}
                          onDragOver={(e: ChangeEvent) => e.preventDefault()}
                          style={{
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <input
                            {...getInputProps({
                              accept: allowedFileExtensions.map(ext => '.' + ext).join(', '),
                              multiple: false,
                            })}
                          />
                          <p>{getDropZoneText(isDragActive)}</p>
                        </Flex>
                      </DropContainer>
                    )}
                  </Dropzone>
                  <FileList>
                    {selectedFile ? (
                      <div className="fileName">
                        <span className="name">{selectedFile.name}</span>
                        <MdDelete
                          size={20}
                          color={colors.icons}
                          style={{
                            cursor: 'pointer',
                            marginLeft: '5px',
                          }}
                          onClick={handleDeleteFile}
                        />
                      </div>
                    ) : (
                      <Typography variant="caption" sx={{ margin: 'auto' }}>
                        {'Nenhum arquivo selecionado'}
                      </Typography>
                    )}
                  </FileList>
                </Flex>
                <Typography variant="caption" sx={{ marginTop: '8px' }}>
                  {`Formatos aceitos: ${allowedFileExtensions
                    .map(ext => ext.toUpperCase())
                    .join(', ')}.`}
                </Typography>
              </Box>
            </>
          </Box>

          <Box width={'100%'} height={'1px'} bgcolor={colors.quartiary} mt={'40px'} />
          <Box width={'100%'} display={'flex'} justifyContent={'end'} mt={'10px'}>
            <Button
              color="primary"
              variant="outlined"
              sx={{
                width: '100px',
                height: '36px',
                textTransform: 'none',
              }}
              onClick={handleClose}
            >
              {cancelButtonText}
            </Button>
            {showConfirmButton && (
              <Button
                disabled={!selectedFile}
                variant="contained"
                sx={{
                  minWidth: '124px',
                  height: '36px',
                  color: colors.white,
                  textTransform: 'none',
                  marginLeft: '16px',
                }}
                color="secondary"
                onClick={handleFileUpload}
              >
                {confirmButtonText}
              </Button>
            )}
          </Box>
        </Content>
      </Modal>
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

export default DocumentRevisionModal;
