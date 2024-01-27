import { Box, Modal, Typography, Button } from '@mui/material';
import { BsDownload } from 'react-icons/bs';
import { IoCheckmarkOutline } from 'react-icons/io5';

import { colors } from '@/styles/globals';

import { MdClose } from 'react-icons/md';
import { Content, Title } from './styles';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface IConfirmDownloadDocumentProps {
  isOpen: boolean;
  onClose: () => void;
  documents: any[];
}

const ConfirmDownloadDocument = ({ isOpen, onClose, documents }: IConfirmDownloadDocumentProps) => {
  const route = useRouter();

  const [downloadedDocuments, setDownloadedDocuments] = useState<Array<boolean>>(
    Array(documents.length).fill(false),
  );

  const handleClose = () => {
    onClose();

    if (route.asPath.includes('trabalho')) {
      route.push('/trabalhos');
    }

    if (route.asPath.includes('cliente')) {
      route.push('/clientes');
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} style={{ overflowY: 'auto' }}>
      <Content>
        <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
          <Title style={{ fontSize: '28px' }}>{'Cadastro Concluido'}</Title>
          <Box sx={{ cursor: 'pointer' }} onClick={onClose}>
            <MdClose size={26} />
          </Box>
        </Box>
        <Box width={'100%'} height={'1px'} bgcolor={colors.quartiary} />

        <Box mt={'20px'}>
          <Typography
            variant="subtitle1"
            style={{
              fontWeight: '400',
              fontSize: '20px',
              color: colors.black,
            }}
          >{`Arquivos para Download`}</Typography>
        </Box>

        {
          <Box mt={'20px'}>
            {documents.map((document, index) => (
              <div
                key={document.url}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <Typography
                  variant="subtitle1"
                  style={{
                    fontWeight: '400',
                    fontSize: '18px',
                    color: colors.black,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    gap: '8px',
                  }}
                  onClick={() => {
                    window.open(document.url, '_blank');
                    const updatedDownloadedDocuments = [...downloadedDocuments];
                    updatedDownloadedDocuments[index] = true;
                    setDownloadedDocuments(updatedDownloadedDocuments);
                  }}
                >
                  {downloadedDocuments[index] ? (
                    <IoCheckmarkOutline size={20} color={colors.green} />
                  ) : (
                    <BsDownload size={20} color={colors.primary} />
                  )}
                  {document.document_type
                    ? document.document_type === 'procuration'
                      ? 'Procuração'
                      : document.document_type === 'waiver'
                      ? 'Termo de Renúncia'
                      : 'Declaração de Carência'
                    : 'Procuração Simples'}
                </Typography>
              </div>
            ))}
          </Box>
        }

        <Box width={'100%'} display={'flex'} justifyContent={'end'} mt={'20px'}>
          <Button
            color="primary"
            variant="outlined"
            sx={{
              width: '100px',
              height: '36px',
            }}
            onClick={handleClose}
          >
            {'Fechar'}
          </Button>
        </Box>
      </Content>
    </Modal>
  );
};

export default ConfirmDownloadDocument;
