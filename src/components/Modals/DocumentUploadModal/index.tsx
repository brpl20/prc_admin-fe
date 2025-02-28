import { Box, Modal, Button, Typography } from '@mui/material';
import { colors, Flex } from '@/styles/globals';
import { MdClose, MdDelete } from 'react-icons/md';
import { Content, FileList } from './styles';
import { ChangeEvent, DragEvent, useState } from 'react';
import { Notification } from '@/components';

interface IDocumentUploadModalProps {
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

const DocumentUploadModal = ({
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
}: IDocumentUploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const allowedFileExtensions = ['docx', 'pdf'];
  const acceptedTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
  ];

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    let isValid = true;
    Array.from(e.dataTransfer.files).forEach(file => {
      if (!acceptedTypes.includes(file.type)) {
        isValid = false;
        setShowError(true);
        setErrorMessage('Apenas arquivos DOCX e PDF são permitidos!');
        return;
      }
    });

    if (isValid) {
      const newFiles = Array.from(e.dataTransfer.files);
      setSelectedFile(newFiles[0]);
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
                  <label
                    htmlFor="dropzone-file"
                    className="cursor-pointer w-1/2 flex flex-col items-center justify-center rounded-lg border border-dashed border-[#41414D] hover:bg-gray-100"
                    onDrop={handleDrop}
                    onDragOver={(e: DragEvent) => {
                      e.preventDefault();
                    }}
                  >
                    <>
                      <div className="flex flex-col items-center justify-center gap-[16px]">
                        <button
                          className="rounded-[4px] border border-transparent bg-transparent text-[14px] font-medium text-[#A8A8B3]"
                          onClick={() => document.getElementById('dropzone-file')?.click()}
                        >
                          Arraste aqui
                        </button>
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        accept={acceptedTypes.join(', ')}
                        className="hidden"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                          }
                        }}
                        size={64}
                      />
                    </>
                  </label>
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

export default DocumentUploadModal;
