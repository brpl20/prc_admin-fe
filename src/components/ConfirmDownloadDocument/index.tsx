import { Box, Modal, Typography, Button, CircularProgress } from '@mui/material';

import { colors } from '@/styles/globals';

import { MdClose } from 'react-icons/md';
import { Content, Title } from './styles';
import { useRouter } from 'next/router';

interface IConfirmDownloadDocumentProps {
  isOpen: boolean;
  onClose: () => void;
  handleConfirm: () => void;
}

const ConfirmDownloadDocument = ({
  isOpen,
  onClose,
  handleConfirm,
}: IConfirmDownloadDocumentProps) => {
  const route = useRouter();

  const handleClose = () => {
    onClose();

    route.push('/trabalhos');
  };

  const handleConfirmDownload = () => {
    handleConfirm();
    onClose();

    route.push('/trabalhos');
  };

  return (
    <Modal open={isOpen} onClose={onClose} style={{ overflowY: 'auto' }}>
      <Content>
        <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
          <Title style={{ fontSize: '28px' }}>{'Confirmação'}</Title>
          <Box sx={{ cursor: 'pointer' }} onClick={onClose}>
            <MdClose size={26} />
          </Box>
        </Box>
        <Box width={'100%'} height={'1px'} bgcolor={colors.quartiary} />

        <Box mt={'20px'}>
          <Typography variant="subtitle1">
            {`Você tem certeza que deseja baixar os Documentos ?`}
          </Typography>
        </Box>

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
            {'Cancelar'}
          </Button>
          <Button
            variant="contained"
            sx={{
              width: '100px',
              height: '36px',
              color: colors.white,
              textTransform: 'none',
              marginLeft: '16px',
            }}
            color="secondary"
            onClick={handleConfirmDownload}
          >
            {'Baixar'}
          </Button>
        </Box>
      </Content>
    </Modal>
  );
};

export default ConfirmDownloadDocument;
